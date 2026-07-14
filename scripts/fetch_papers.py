#!/usr/bin/env python3
"""
Weekly Research Paper Fetcher for Upper Limb Rehabilitation Robots

Queries Semantic Scholar and arXiv APIs for the latest papers in upper limb
rehabilitation robotics, generates bilingual MDX files for the Next.js site.

Usage:
    python scripts/fetch_papers.py          # Fetch and generate MDX files
    python scripts/fetch_papers.py --dry-run  # Preview without writing files
"""

import os
import re
import json
import hashlib
import argparse
import textwrap
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import requests

# ============================================================
# Configuration
# ============================================================

CONTENT_DIR = Path(__file__).resolve().parent.parent / "content" / "papers"

# Keywords for Semantic Scholar / arXiv queries
QUERIES = [
    "upper limb rehabilitation robot",
    "cable-driven hand exoskeleton",
    "tendon-driven hand rehabilitation",
    "soft robotic glove rehabilitation",
    "hand exoskeleton stroke rehabilitation",
    "wrist rehabilitation robot exoskeleton",
    "上肢康复机器人",
]

# arXiv categories to search
ARXIV_CATEGORIES = ["cs.RO", "eess.SY", "q-bio.NC"]

# Lookback window in days
LOOKBACK_DAYS = 30

# Maximum results per API call
MAX_RESULTS = 50

# Tag mapping: keyword in title/abstract -> tag (Chinese, English)
TAG_RULES = [
    (["cable-driven", "cable driven", "tendon-driven", "tendon driven", "bowden", "绳索驱动", "绳驱动", "索驱动", "肌腱驱动"],
     ("绳索驱动", "cable-driven")),
    (["exoskeleton", "exo-skeleton", "外骨骼"],
     ("外骨骼", "exoskeleton")),
    (["soft robot", "soft robotic", "soft glove", "soft exo", "软体", "柔性"],
     ("软体机器人", "soft robotics")),
    (["parallel robot", "cdpr", "并联"],
     ("并联机器人", "parallel robot")),
    (["hand", "finger", "grip", "grasp", "手", "手指", "抓握"],
     ("手部康复", "hand rehabilitation")),
    (["wrist", "腕"],
     ("腕关节", "wrist")),
    (["stroke", "post-stroke", "脑卒中", "中风"],
     ("脑卒中", "stroke")),
    (["clinical trial", "clinical study", "临床"],
     ("临床验证", "clinical trial")),
    (["emg", "semg", "eeg", "myoelectric", "肌电", "脑机"],
     ("人机接口", "human-machine interface")),
    (["rehabilitation", "康复"],
     ("康复训练", "rehabilitation")),
    (["wearable", "portable", "可穿戴", "便携"],
     ("可穿戴", "wearable")),
    (["twisted string", "tsa", "扭转绳"],
     ("TSA", "twisted-string actuator")),
    (["magnetorheological", "mr fluid", "磁流变"],
     ("磁流变", "magnetorheological")),
    (["spasticity", "痉挛"],
     ("痉挛评估", "spasticity")),
    (["upper limb", "upper extremity", "arm", "上肢", "手臂", "胳膊"],
     ("上肢康复", "upper limb")),
    (["shoulder", "elbow", "肩", "肘"],
     ("肩肘康复", "shoulder-elbow")),
]

# ============================================================
# Helpers
# ============================================================

def slugify(text: str) -> str:
    """Convert text to a URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text[:80]


def extract_date(item: dict) -> Optional[str]:
    """Extract publication date from a paper item."""
    # Semantic Scholar format
    if "publicationDate" in item and item["publicationDate"]:
        return item["publicationDate"]
    if "year" in item and item["year"]:
        year = item["year"]
        month = item.get("publicationDate", f"{year}-01-01")[5:7] if item.get("publicationDate") else "01"
        return f"{year}-{month}-01"
    # arXiv format
    if "published" in item:
        return item["published"][:10]
    return None


def match_tags(title: str, abstract: str) -> tuple[list[str], list[str]]:
    """Match keywords to generate Chinese and English tags."""
    text = f"{title} {abstract}".lower()
    tags_zh, tags_en = [], []
    for keywords, (tag_zh, tag_en) in TAG_RULES:
        if any(kw.lower() in text for kw in keywords):
            if tag_zh not in tags_zh:
                tags_zh.append(tag_zh)
                tags_en.append(tag_en)
    # Ensure at least one tag
    if not tags_zh:
        tags_zh = ["上肢康复"]
        tags_en = ["upper limb rehabilitation"]
    return tags_zh, tags_en


def translate_to_chinese(text: str) -> str:
    """Attempt to translate English text to Chinese using a free API.
    Falls back to original text if translation fails."""
    if not text:
        return text
    # Skip if already mostly Chinese
    chinese_chars = len(re.findall(r'[一-鿿]', text))
    if chinese_chars > len(text) * 0.3:
        return text

    try:
        # Use Google Translate unofficial API (no key required)
        url = "https://translate.googleapis.com/translate_a/single"
        params = {
            "client": "gtx",
            "sl": "en",
            "tl": "zh-CN",
            "dt": "t",
            "q": text[:1500],  # Limit text length
        }
        resp = requests.get(url, params=params, timeout=10)
        if resp.status_code == 200:
            result = resp.json()
            translated = "".join(part[0] for part in result[0] if part[0])
            return translated
    except Exception:
        pass
    return text


def generate_summary_zh(abstract_en: str) -> str:
    """Generate a Chinese summary from English abstract."""
    if not abstract_en:
        return "（暂无中文摘要）"
    translated = translate_to_chinese(abstract_en)
    if translated == abstract_en:
        return "（翻译失败，请参考英文摘要）"
    # Truncate to ~300 chars
    if len(translated) > 300:
        translated = translated[:300] + "..."
    return translated


def load_existing_dois() -> set[str]:
    """Scan existing MDX files for DOIs (avoid duplicates)."""
    dois = set()
    if not CONTENT_DIR.exists():
        return dois
    for f in CONTENT_DIR.glob("*.mdx"):
        content = f.read_text(encoding="utf-8")
        m = re.search(r'doi:\s*"([^"]+)"', content)
        if m:
            dois.add(m.group(1).lower())
        m = re.search(r'source_url:\s*"([^"]+)"', content)
        if m:
            dois.add(m.group(1).lower())
    return dois


# ============================================================
# API Fetchers
# ============================================================

def fetch_semantic_scholar(query: str, offset: int = 0, limit: int = MAX_RESULTS) -> list[dict]:
    """Fetch papers from Semantic Scholar API."""
    url = "https://api.semanticscholar.org/graph/v1/paper/search"
    params = {
        "query": query,
        "offset": offset,
        "limit": limit,
        "fields": "title,abstract,authors,year,publicationDate,externalIds,url,venue",
        "sort": "publicationDate:desc",
    }
    try:
        resp = requests.get(url, params=params, timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            return data.get("data", [])
        elif resp.status_code == 429:
            print(f"  Rate limited by Semantic Scholar, waiting...")
            import time
            time.sleep(5)
            return []
    except Exception as e:
        print(f"  Semantic Scholar error: {e}")
    return []


def fetch_arxiv(query: str, max_results: int = 30) -> list[dict]:
    """Fetch papers from arXiv API."""
    url = "http://export.arxiv.org/api/query"
    params = {
        "search_query": f"all:{query}",
        "start": 0,
        "max_results": max_results,
        "sortBy": "submittedDate",
        "sortOrder": "descending",
    }
    try:
        resp = requests.get(url, params=params, timeout=30)
        if resp.status_code == 200:
            # Parse Atom XML
            entries = []
            feed = resp.text
            # Simple XML parsing (no deps needed)
            entry_pattern = re.compile(r'<entry>(.*?)</entry>', re.DOTALL)
            for entry_match in entry_pattern.finditer(feed):
                entry_xml = entry_match.group(1)
                title_m = re.search(r'<title>(.*?)</title>', entry_xml, re.DOTALL)
                summary_m = re.search(r'<summary>(.*?)</summary>', entry_xml, re.DOTALL)
                published_m = re.search(r'<published>(\d{4}-\d{2}-\d{2})', entry_xml)
                author_m = re.findall(r'<author>.*?<name>(.*?)</name>.*?</author>', entry_xml, re.DOTALL)
                link_m = re.search(r'<id>(.*?)</id>', entry_xml)
                entries.append({
                    "title": title_m.group(1).strip().replace('\n', ' ') if title_m else "",
                    "abstract": summary_m.group(1).strip().replace('\n', ' ') if summary_m else "",
                    "published": published_m.group(1) if published_m else "",
                    "authors": author_m if author_m else [],
                    "url": link_m.group(1).strip() if link_m else "",
                })
            return entries
    except Exception as e:
        print(f"  arXiv error: {e}")
    return []


# ============================================================
# MDX Generator
# ============================================================

def generate_mdx(paper: dict) -> str:
    """Generate MDX content for a paper."""
    title = paper["title"]
    abstract = paper.get("abstract", "")
    authors = paper.get("authors", [])
    date = paper.get("date", datetime.now().strftime("%Y-%m-%d"))
    source = paper.get("source", "Unknown")
    source_url = paper.get("source_url", paper.get("url", ""))
    doi = paper.get("doi", "")

    tags_zh, tags_en = match_tags(title, abstract)
    title_zh = translate_to_chinese(title) if not re.search(r'[一-鿿]', title) else title
    summary_zh = generate_summary_zh(abstract) if abstract else ""

    slug = slugify(title)[:60]
    filename_date = date[:10] if date else datetime.now().strftime("%Y-%m-%d")

    # Clean authors to a list
    if isinstance(authors, str):
        authors = [a.strip() for a in authors.split(",") if a.strip()]
    elif isinstance(authors, list) and authors and isinstance(authors[0], dict):
        authors = [a.get("name", "") for a in authors]

    mdx = textwrap.dedent(f"""\
    ---
    title: "{title_zh[:150]}"
    title_en: "{title[:300]}"
    authors: {json.dumps(authors[:10], ensure_ascii=False)}
    date: "{date[:10]}"
    source: "{source[:200]}"
    source_url: "{source_url[:500]}"
    doi: "{doi[:100]}"
    tags: {json.dumps(tags_zh, ensure_ascii=False)}
    tags_en: {json.dumps(tags_en, ensure_ascii=False)}
    keywords: {json.dumps(tags_zh, ensure_ascii=False)}
    keywords_en: {json.dumps(tags_en, ensure_ascii=False)}
    ---

    ## 中文摘要

    {summary_zh if summary_zh else '（暂无中文摘要，请参考英文部分）'}

    ## English Summary

    {abstract if abstract else 'No abstract available.'}
    """)
    return mdx


# ============================================================
# Main Pipeline
# ============================================================

def main(dry_run: bool = False):
    print("=" * 60)
    print("Upper Limb Rehab Research Paper Fetcher")
    print(f"Run time: {datetime.now().isoformat()}")
    print(f"Lookback: {LOOKBACK_DAYS} days")
    print(f"Output dir: {CONTENT_DIR}")
    print("=" * 60)

    existing_dois = load_existing_dois()
    print(f"\n📚 Existing papers in repo: {len(existing_dois)}")

    # Create output directory
    if not dry_run:
        CONTENT_DIR.mkdir(parents=True, exist_ok=True)

    all_papers = []
    cutoff_date = (datetime.now() - timedelta(days=LOOKBACK_DAYS)).strftime("%Y-%m-%d")

    # --- Semantic Scholar ---
    print("\n🔍 Querying Semantic Scholar...")
    for query in QUERIES:
        print(f"  Query: '{query}'")
        for offset in [0, 50]:
            papers = fetch_semantic_scholar(query, offset=offset, limit=50)
            for p in papers:
                pub_date = extract_date(p) or "unknown"
                if pub_date < cutoff_date:
                    continue
                key = (p.get("externalIds", {}).get("DOI") or p.get("url") or "").lower()
                if key and key in existing_dois:
                    continue
                all_papers.append({
                    "title": p.get("title", ""),
                    "abstract": p.get("abstract", ""),
                    "authors": p.get("authors", []),
                    "date": pub_date,
                    "source": p.get("venue", {}).get("name", p.get("journal", {}).get("name", "Unknown")),
                    "source_url": p.get("url", ""),
                    "doi": p.get("externalIds", {}).get("DOI", ""),
                    "url": p.get("url", ""),
                })

    # --- arXiv ---
    print("\n🔍 Querying arXiv...")
    for query in QUERIES[:4]:  # Limit arXiv queries
        print(f"  Query: '{query}'")
        papers = fetch_arxiv(query, max_results=30)
        for p in papers:
            pub_date = p.get("published", "unknown")
            if pub_date < cutoff_date:
                continue
            key = (p.get("url", "")).lower()
            if key and key in existing_dois:
                continue
            all_papers.append({
                "title": p.get("title", ""),
                "abstract": p.get("abstract", ""),
                "authors": p.get("authors", []),
                "date": pub_date,
                "source": "arXiv",
                "source_url": p.get("url", ""),
                "doi": "",
                "url": p.get("url", ""),
            })

    # Deduplicate by title similarity
    seen_titles = set()
    unique_papers = []
    for p in all_papers:
        title_key = slugify(p["title"])[:40]
        if title_key in seen_titles:
            continue
        seen_titles.add(title_key)
        unique_papers.append(p)

    print(f"\n📊 Total new papers found: {len(unique_papers)}")

    if not unique_papers:
        print("No new papers to add. Exiting.")
        return

    # Generate MDX files
    generated = 0
    for paper in unique_papers:
        try:
            mdx_content = generate_mdx(paper)
            date_part = paper["date"][:10] if paper["date"] else datetime.now().strftime("%Y-%m-%d")
            slug_part = slugify(paper["title"])[:50]
            filename = f"{date_part}-{slug_part}.mdx"

            if dry_run:
                print(f"\n  📄 [DRY RUN] {filename}")
                print(f"     Title: {paper['title'][:80]}")
            else:
                filepath = CONTENT_DIR / filename
                # Avoid overwrite
                if filepath.exists():
                    filename = f"{date_part}-{slug_part}-{hashlib.md5(paper['title'].encode()).hexdigest()[:6]}.mdx"
                    filepath = CONTENT_DIR / filename
                filepath.write_text(mdx_content, encoding="utf-8")
                print(f"  ✅ {filename}")
                generated += 1
        except Exception as e:
            print(f"  ❌ Error generating MDX for '{paper.get('title', '?')[:50]}': {e}")

    print(f"\n✅ Done. Generated {generated} new paper MDX files.")
    if dry_run:
        print("   (Dry run — no files were written)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch upper limb rehab research papers")
    parser.add_argument("--dry-run", action="store_true", help="Preview without writing files")
    args = parser.parse_args()
    main(dry_run=args.dry_run)

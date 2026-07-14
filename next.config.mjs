import createMDX from '@next/mdx'

const withMDX = createMDX({
  extension: /\.mdx?$/,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  output: 'export',
  // GitHub Pages project site needs basePath
  basePath: process.env.GITHUB_ACTIONS ? '/upper-limb-rehab-news' : '',
  // Disable image optimization (not supported in static export)
  images: { unoptimized: true },
}

export default withMDX(nextConfig)

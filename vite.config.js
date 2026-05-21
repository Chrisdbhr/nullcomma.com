import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sitemap } from 'vite-plugin-sitemap-ts'

const CMS_URL = 'https://cms.nullcomma.com'
const SITE_URL = 'https://nullcomma.com'

const STATIC_ROUTES = [
  { loc: '/', priority: 1.0, changefreq: 'weekly' },
  { loc: '/about', priority: 0.8, changefreq: 'monthly' },
  { loc: '/blog', priority: 0.9, changefreq: 'weekly' },
  { loc: '/privacy', priority: 0.5, changefreq: 'monthly' },
  { loc: '/privacy.html', priority: 0.5, changefreq: 'monthly' },
  { loc: '/terms', priority: 0.5, changefreq: 'monthly' },
  { loc: '/terms.html', priority: 0.5, changefreq: 'monthly' },
]

export default defineConfig(async () => {
  let dynamicRoutes = []
  try {
    const [projectsRes, blogRes] = await Promise.all([
      fetch(`${CMS_URL}/items/projects?fields=id&filter[status][_eq]=published`),
      fetch(`${CMS_URL}/items/blog_posts?fields=id&filter[status][_eq]=published`),
    ])

    if (projectsRes.ok) {
      const projects = await projectsRes.json()
      dynamicRoutes.push(
        ...projects.data.map(p => ({
          loc: `/project/${p.id}`,
          priority: 0.7,
          changefreq: 'monthly',
        }))
      )
    }

    if (blogRes.ok) {
      const blog = await blogRes.json()
      dynamicRoutes.push(
        ...blog.data.map(p => ({
          loc: `/blog/${p.id}`,
          priority: 0.7,
          changefreq: 'monthly',
        }))
      )
    }
  } catch (err) {
    console.warn('Sitemap: failed to fetch CMS routes:', err.message)
  }

  const allRoutes = [...STATIC_ROUTES, ...dynamicRoutes]

  return {
    plugins: [
      react(),
      sitemap({
        hostname: SITE_URL,
        routes: allRoutes,
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'markdown': ['react-markdown', 'rehype-raw', 'rehype-slug'],
            'syntax-highlighter': ['react-syntax-highlighter'],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      exclude: ['**/performance/**', '**/e2e/**', '**/node_modules/**'],
    },
  }
})

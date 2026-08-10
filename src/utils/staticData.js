let staticDataCache = null

/**
 * Reads the snapshot data embedded by scripts/generate-static-pages.mjs
 * into every generated page (window.__STATIC_DATA__).
 */
export function getStaticData() {
  if (staticDataCache) return staticDataCache
  if (typeof window === 'undefined') return null
  try {
    staticDataCache = window.__STATIC_DATA__ || null
  } catch {
    staticDataCache = null
  }
  return staticDataCache
}

export function getStaticProjects() {
  return getStaticData()?.projects || null
}

export function getStaticPosts() {
  return getStaticData()?.posts || null
}

/**
 * fetch() with a hard timeout. Used for CMS calls so that a dead CMS
 * (e.g. cms.nullcomma.com down) falls back to the embedded snapshot fast.
 */
export async function fetchJsonCms(url, timeoutMs = 4000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

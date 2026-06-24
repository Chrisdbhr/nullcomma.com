import { useEffect, useRef } from 'react'

export function useMasonry(containerRef, deps = []) {
  const rafRef = useRef()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const GAP = 25
    const MIN_COL_WIDTH = 280

    const layout = () => {
      const items = Array.from(container.children)
      if (items.length === 0) {
        container.style.height = '0'
        return
      }

      const containerWidth = container.offsetWidth
      if (containerWidth <= 0) return

      const cols = Math.max(1, Math.floor((containerWidth + GAP) / (MIN_COL_WIDTH + GAP)))
      const colWidth = (containerWidth - (cols - 1) * GAP) / cols
      const colHeights = new Array(cols).fill(0)

      items.forEach(item => {
        const col = colHeights.indexOf(Math.min(...colHeights))

        item.style.width = `${colWidth}px`
        item.style.position = 'absolute'
        item.style.top = `${colHeights[col]}px`
        item.style.left = `${col * (colWidth + GAP)}px`

        colHeights[col] += item.offsetHeight + GAP
      })

      container.style.position = 'relative'
      container.style.height = `${Math.max(...colHeights)}px`
    }

    const schedule = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(layout)
    }

    schedule()

    const onResize = () => schedule()
    window.addEventListener('resize', onResize)

    const ro = new ResizeObserver(schedule)
    Array.from(container.children).forEach(child => ro.observe(child))

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
    }
  }, [containerRef, ...deps])
}

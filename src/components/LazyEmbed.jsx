import React, { useState, useRef, useEffect } from 'react'

/**
 * Wrapper that defers iframe mounting until it enters the viewport.
 * Shows a placeholder while waiting.
 */
function LazyEmbed({ src, title, className, width, height, placeholder, ...props }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`lazy-embed ${className || ''}`}>
      {visible ? (
        <iframe
          src={src}
          title={title || ''}
          width={width || '100%'}
          height={height || '400'}
          loading="lazy"
          allowFullScreen
          {...props}
        />
      ) : (
        <div className="lazy-embed-placeholder">
          {placeholder || 'Loading embed...'}
        </div>
      )}
    </div>
  )
}

export default LazyEmbed

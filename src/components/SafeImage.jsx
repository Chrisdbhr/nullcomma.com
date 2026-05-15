import React, { useState } from 'react'
import { getAssetUrl, getFallbackUrl } from '../utils'

/**
 * Image component that automatically falls back to JPG if the native format (AVIF/WebP) fails to load.
 * This ensures compatibility with browsers that don't support modern image formats.
 */
function SafeImage({ id, width, options, mimeType, alt, className, ...imgProps }) {
  const [src, setSrc] = useState(() => getAssetUrl(id, width, options, mimeType))
  const [error, setError] = useState(false)

  if (!id || error) {
    return null
  }

  const handleError = () => {
    const fallback = getFallbackUrl(id, width, options)
    if (fallback && fallback !== src) {
      setSrc(fallback)
    } else {
      setError(true)
    }
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      {...imgProps}
    />
  )
}

export default SafeImage

import React, { useState } from 'react'
import { getAssetUrl, getFallbackUrl } from '../utils'

/**
 * Image component that uses <picture> element to provide format fallback.
 * The browser picks the first <source> it supports, ensuring compatibility
 * with AVIF/WebP-native servers while gracefully falling back to JPG.
 *
 * GIFs are converted to animated WebP by the server for better compression.
 * When both primary and fallback sources fail (e.g., 403), shows a placeholder.
 */
function SafeImage({ id, width, options, mimeType, alt, className, ...imgProps }) {
  const [failed, setFailed] = useState(false)

  if (!id) {
    return null
  }

  const handleError = () => {
    setFailed(true)
  }

  if (failed) {
    return (
      <div className="safe-image-fallback" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', color: '#666', fontSize: '0.875rem', width: '100%', height: '100%', minHeight: '120px' }}>
        Image unavailable
      </div>
    )
  }

  const primarySrc = getAssetUrl(id, width, options, mimeType)
  const fallbackSrc = getFallbackUrl(id, width, options)

  // For modern formats (AVIF, WebP, GIF→WebP), use <picture> with type hints
  // so the browser can skip formats it doesn't support and fall back to JPG.
  const isModernFormat = mimeType && (
    mimeType.toLowerCase().includes('avif') ||
    mimeType.toLowerCase().includes('webp') ||
    mimeType.toLowerCase().includes('gif')
  )

  if (isModernFormat) {
    const sourceType = mimeType.toLowerCase().includes('gif') ? 'image/webp' : mimeType
    return (
      <picture>
        <source srcSet={primarySrc} type={sourceType} />
        <source srcSet={fallbackSrc} type="image/jpeg" />
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
          onError={handleError}
          {...imgProps}
        />
      </picture>
    )
  }

  // For PNG, JPG, or unknown formats, use direct <img>
  return (
    <img
      src={primarySrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...imgProps}
    />
  )
}

export default SafeImage

import React from 'react'
import { getAssetUrl, getFallbackUrl } from '../utils'

/**
 * Image component that uses <picture> element to provide format fallback.
 * The browser picks the first <source> it supports, ensuring compatibility
 * with AVIF/WebP-native servers while gracefully falling back to JPG.
 *
 * GIFs are converted to animated WebP by the server for better compression.
 */
function SafeImage({ id, width, options, mimeType, alt, className, ...imgProps }) {
  if (!id) {
    return null
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
      {...imgProps}
    />
  )
}

export default SafeImage

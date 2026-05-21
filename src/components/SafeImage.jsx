import React, { useState } from 'react'
import { getAssetUrl, getFallbackUrl, baseURL } from '../utils'

/**
 * Image component that uses <picture> element to provide format fallback.
 * Shows a skeleton shimmer placeholder while loading.
 * The browser picks the first <source> it supports, ensuring compatibility
 * with AVIF/WebP-native servers while gracefully falling back to JPG.
 *
 * GIFs are converted to animated WebP by the server for better compression.
 * When both primary and fallback sources fail (e.g., 403, 500), shows a placeholder.
 */
function SafeImage({ id, src, width, options, mimeType, alt, className, quality, useOriginal, fetchpriority, ...imgProps }) {
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  if (!id && !src) {
    return null
  }

  const handleLoad = () => {
    setLoading(false)
  }

  const handleError = () => {
    setLoading(false)
    setFailed(true)
  }

  if (failed) {
    return (
      <div className="safe-image-fallback">
        Image unavailable
      </div>
    )
  }

  const commonImgProps = {
    alt,
    className: `${className || ''} ${loading ? 'image-loading' : ''}`.trim(),
    onLoad: handleLoad,
    onError: handleError,
    fetchpriority,
    ...imgProps,
  }

  // When src is provided, render external URL directly (e.g. Steam CDN)
  if (src) {
    return (
      <img
        src={src}
        {...commonImgProps}
      />
    )
  }

  const originalSrc = `${baseURL}/assets/${id}`
  const primarySrc = getAssetUrl(id, width, options, mimeType, quality)
  const fallbackSrc = getFallbackUrl(id, width, options)

  // When useOriginal is true, serve the full-resolution image directly
  if (useOriginal) {
    return (
      <img
        src={originalSrc}
        {...commonImgProps}
      />
    )
  }

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
        <source srcSet={originalSrc} type={sourceType} />
        <img
          src={originalSrc}
          {...commonImgProps}
        />
      </picture>
    )
  }

  // For PNG, JPG, or unknown formats, use direct <img>
  return (
    <img
      src={primarySrc}
      {...commonImgProps}
    />
  )
}

export default SafeImage

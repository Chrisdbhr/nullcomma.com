import React, { useState, useEffect, useCallback, useRef } from 'react'
import SafeImage from './SafeImage'
import { baseURL } from '../utils'

const THUMBNAIL_WIDTH = 100;
const THUMBNAIL_HEIGHT = 60;
const MAIN_IMAGE_WIDTH = 1200;

const THUMBNAIL_QUALITY = 40;
const MAIN_IMAGE_QUALITY = 70;
const LIGHTBOX_QUALITY = 85;

const AUTO_PLAY_INTERVAL = 4000;

/**
 * Normalize screenshots from either Directus or Steam format.
 * Directus: { directus_files_id: { id, type } }
 * Steam: "https://cdn.steamstatic.com/..."
 */
function normalizeScreenshots(screenshots) {
  if (!screenshots || !Array.isArray(screenshots)) return [];

  return screenshots.map(ss => {
    if (typeof ss === 'string') {
      return { url: ss, type: 'image/jpeg', isExternal: true };
    }
    if (ss.directus_files_id) {
      return {
        id: ss.directus_files_id.id,
        type: ss.directus_files_id.type,
        isExternal: false,
      };
    }
    return ss;
  });
}

function ScreenshotGallery({ screenshots }) {
  const normalizedScreenshots = normalizeScreenshots(screenshots);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxDimensions, setLightboxDimensions] = useState({ width: 1200, height: 800 });
  const [progress, setProgress] = useState(0);
  const [progressDirection, setProgressDirection] = useState('empty'); // 'empty' or 'fill'
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const autoPlayRef = useRef(null);
  const progressRef = useRef(null);
  const startTimeRef = useRef(null);

  const selectedScreenshot = normalizedScreenshots[selectedIndex] || null;
  const lightboxImage = normalizedScreenshots[lightboxIndex];

  const resetTimer = useCallback(() => {
    if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(progressDirection === 'empty' ? 100 : 0);
    startTimeRef.current = Date.now();
    setResetKey(k => k + 1);
  }, [progressDirection]);

  const advanceIndex = useCallback((setCurrentIndex) => {
    setCurrentIndex(prev => {
      const next = (prev + 1 + normalizedScreenshots.length) % normalizedScreenshots.length;
      return next;
    });
    resetTimer();
  }, [normalizedScreenshots.length, resetTimer]);

  const openLightbox = useCallback((index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    setAutoPlayEnabled(false);
    if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setProgress(0);
    setProgressDirection('empty');
    if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    document.body.style.overflow = '';
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          advanceIndex(setLightboxIndex);
          break;
        case 'ArrowRight':
          e.preventDefault();
          advanceIndex(setLightboxIndex);
          break;
        case 'Escape':
          e.preventDefault();
          closeLightbox();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, advanceIndex, closeLightbox]);

  // Calculate lightbox image dimensions based on viewport
  useEffect(() => {
    if (!lightboxOpen) return;

    const updateDimensions = () => {
      const padding = 120;
      const maxWidth = window.innerWidth - padding;
      const maxHeight = window.innerHeight - padding;
      let width = maxWidth;
      let height = width * (9 / 16);
      if (height > maxHeight) {
        height = maxHeight;
        width = height * (16 / 9);
      }
      setLightboxDimensions({ width: Math.round(width), height: Math.round(height) });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [lightboxOpen]);

  // Auto-play carousel - stops when user clicks an image
  useEffect(() => {
    if (!autoPlayEnabled || normalizedScreenshots.length <= 1) return;

    startTimeRef.current = Date.now();

    // Progress bar update every 50ms - alternates direction each cycle
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = (elapsed / AUTO_PLAY_INTERVAL) * 100;
      if (progressDirection === 'empty') {
        setProgress(Math.max(100 - pct, 0));
      } else {
        setProgress(Math.min(pct, 100));
      }
    }, 50);

    // Advance to next image after interval
    autoPlayRef.current = setTimeout(() => {
      // Toggle direction for next cycle
      setProgressDirection(d => d === 'empty' ? 'fill' : 'empty');
      if (lightboxOpen) {
        setLightboxIndex(prev => (prev + 1 + normalizedScreenshots.length) % normalizedScreenshots.length);
      } else {
        setSelectedIndex(prev => (prev + 1 + normalizedScreenshots.length) % normalizedScreenshots.length);
      }
      // Restart timer for next cycle
      resetTimer();
    }, AUTO_PLAY_INTERVAL);

    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [lightboxOpen, resetKey, normalizedScreenshots.length, resetTimer, autoPlayEnabled]);

  if (normalizedScreenshots.length === 0) {
    return <div className="screenshot-gallery-placeholder">No screenshots available.</div>
  }

  const handleThumbnailClick = (index) => {
    setSelectedIndex(index);
    setAutoPlayEnabled(false);
    if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
  };

  // Dot indicators component
  const DotIndicators = ({ currentIndex, total, onDotClick }) => (
    <div className="gallery-dots">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          className={`gallery-dot ${i === currentIndex ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onDotClick(i); }}
          aria-label={`Go to image ${i + 1}`}
        />
      ))}
    </div>
  );

  const hasMultipleImages = normalizedScreenshots.length > 1;

  return (
    <>
      <div className="screenshot-gallery">
        <div
          className="gallery-main-image"
          onClick={() => openLightbox(selectedIndex)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openLightbox(selectedIndex);
            }
          }}
          title="Click to expand"
        >
          {/* Progress bar for gallery */}
          <div className="gallery-progress-bar">
            <div
              className={`gallery-progress-fill${progressDirection === 'fill' ? ' fill' : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {selectedScreenshot && (
            <SafeImage
              alt="Screenshot principal"
              {...(selectedScreenshot.isExternal
                ? { src: selectedScreenshot.url }
                : { id: selectedScreenshot.id, width: MAIN_IMAGE_WIDTH, quality: MAIN_IMAGE_QUALITY, mimeType: selectedScreenshot.type }
              )}
            />
          )}
          <div className="gallery-expand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </div>
        </div>

        {/* Dot indicators below main image */}
        {hasMultipleImages && (
          <DotIndicators
            currentIndex={selectedIndex}
            total={normalizedScreenshots.length}
            onDotClick={(i) => { setSelectedIndex(i); setAutoPlayEnabled(false); if (autoPlayRef.current) clearTimeout(autoPlayRef.current); if (progressRef.current) clearInterval(progressRef.current); setProgress(0); }}
          />
        )}

        {hasMultipleImages && (
          <div className="gallery-thumbnails">
            {normalizedScreenshots.map((ss, index) => {
              const isSelected = index === selectedIndex;

              return (
                <SafeImage
                  key={ss.url || ss.id}
                  alt={`Thumbnail ${index + 1}`}
                  className={isSelected ? 'active' : ''}
                  onClick={() => handleThumbnailClick(index)}
                  loading="lazy"
                  {...(ss.isExternal
                    ? { src: ss.url }
                    : { id: ss.id, width: THUMBNAIL_WIDTH, options: `height=${THUMBNAIL_HEIGHT}&fit=cover`, quality: THUMBNAIL_QUALITY, mimeType: ss.type }
                  )}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div className="gallery-lightbox" onClick={hasMultipleImages ? undefined : closeLightbox}>
          {/* Progress bar */}
          {hasMultipleImages && (
            <div className="lightbox-progress-bar">
              <div
                className={`lightbox-progress-fill${progressDirection === 'fill' ? ' fill' : ''}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Close button */}
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Image counter */}
          <div className="lightbox-counter">
            {lightboxIndex + 1} / {normalizedScreenshots.length}
          </div>

          {/* Left click zone - previous (only if multiple images) */}
          {hasMultipleImages && (
            <div
              className="lightbox-click-zone lightbox-click-prev"
              onClick={() => advanceIndex(setLightboxIndex)}
              role="button"
              aria-label="Previous image"
            >
              <div className="lightbox-nav lightbox-nav-left">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </div>
            </div>
          )}

          {/* Right click zone - next (only if multiple images) */}
          {hasMultipleImages && (
            <div
              className="lightbox-click-zone lightbox-click-next"
              onClick={() => advanceIndex(setLightboxIndex)}
              role="button"
              aria-label="Next image"
            >
              <div className="lightbox-nav lightbox-nav-right">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          )}

          {/* Main image - full resolution, click closes lightbox */}
          <div className="lightbox-image-container" onClick={closeLightbox}>
            {lightboxImage && (
              <SafeImage
                alt={`Screenshot ${lightboxIndex + 1}`}
                {...(lightboxImage.isExternal
                  ? { src: lightboxImage.url }
                  : { id: lightboxImage.id, useOriginal: true, mimeType: lightboxImage.type }
                )}
              />
            )}
          </div>

          {/* Dot indicators in lightbox */}
          {hasMultipleImages && (
            <div className="lightbox-dots-wrapper">
              <DotIndicators
                currentIndex={lightboxIndex}
                total={normalizedScreenshots.length}
                onDotClick={(i) => { setLightboxIndex(i); resetTimer(); }}
              />
            </div>
          )}

          {/* Thumbnails */}
          {hasMultipleImages && (
            <div className="lightbox-thumbnails">
              {normalizedScreenshots.map((ss, index) => (
                <div
                  key={ss.url || ss.id}
                  className={`lightbox-thumb ${index === lightboxIndex ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(index); resetTimer(); }}
                >
                  <SafeImage
                    alt={`Thumbnail ${index + 1}`}
                    {...(ss.isExternal
                      ? { src: ss.url }
                      : { id: ss.id, width: THUMBNAIL_WIDTH, options: `height=${THUMBNAIL_HEIGHT}&fit=cover`, quality: THUMBNAIL_QUALITY, mimeType: ss.type }
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default ScreenshotGallery

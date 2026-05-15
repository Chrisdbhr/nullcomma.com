import React, { useState, useEffect, useCallback, useRef } from 'react'
import SafeImage from './SafeImage'
import { baseURL } from '../utils'

// Definições de tamanho para otimização do Directus
const THUMBNAIL_WIDTH = 100;
const THUMBNAIL_HEIGHT = 60;
const MAIN_IMAGE_WIDTH = 1200;

// Quality settings
const THUMBNAIL_QUALITY = 40;
const MAIN_IMAGE_QUALITY = 70;
const LIGHTBOX_QUALITY = 85;

// Auto-play interval in milliseconds
const AUTO_PLAY_INTERVAL = 4000;

function ScreenshotGallery({ screenshots }) {
  // Normalize screenshots structure
  const normalizedScreenshots = screenshots.map(ss => ({
    id: ss.directus_files_id.id,
    type: ss.directus_files_id.type,
  }));

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxDimensions, setLightboxDimensions] = useState({ width: 1200, height: 800 });
  const [autoPlay, setAutoPlay] = useState(true);
  const [progress, setProgress] = useState(0);
  const autoPlayRef = useRef(null);
  const progressRef = useRef(null);
  const startTimeRef = useRef(null);

  const selectedScreenshot = normalizedScreenshots[selectedIndex] || null;

  const navigate = useCallback((direction) => {
    setSelectedIndex(prev => {
      const next = (prev + direction + normalizedScreenshots.length) % normalizedScreenshots.length;
      return next;
    });
    setProgress(0);
    startTimeRef.current = Date.now();
  }, [normalizedScreenshots.length]);

  const openLightbox = useCallback((index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    setAutoPlay(false);
    setProgress(0);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setAutoPlay(false);
    document.body.style.overflow = '';
  }, []);

  const navigateLightbox = useCallback((direction) => {
    setLightboxIndex(prev => {
      const next = (prev + direction + normalizedScreenshots.length) % normalizedScreenshots.length;
      return next;
    });
    setProgress(0);
    startTimeRef.current = Date.now();
  }, [normalizedScreenshots.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          navigateLightbox(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateLightbox(1);
          break;
        case 'Escape':
          e.preventDefault();
          closeLightbox();
          break;
        case ' ':
          e.preventDefault();
          setAutoPlay(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, navigateLightbox, closeLightbox]);

  // Calculate lightbox image dimensions based on viewport
  useEffect(() => {
    if (!lightboxOpen) return;

    const updateDimensions = () => {
      const padding = 120; // space for arrows, thumbnails, margins
      const maxWidth = window.innerWidth - padding;
      const maxHeight = window.innerHeight - padding;
      // 16:9 aspect ratio
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

  // Auto-play for lightbox
  useEffect(() => {
    if (!lightboxOpen || !autoPlay) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      return;
    }

    startTimeRef.current = Date.now();

    // Progress bar update every 50ms
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / AUTO_PLAY_INTERVAL) * 100, 100);
      setProgress(pct);
    }, 50);

    // Navigate to next image
    autoPlayRef.current = setInterval(() => {
      setLightboxIndex(prev => {
        const next = (prev + 1 + normalizedScreenshots.length) % normalizedScreenshots.length;
        return next;
      });
      setProgress(0);
      startTimeRef.current = Date.now();
    }, AUTO_PLAY_INTERVAL);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [lightboxOpen, autoPlay, normalizedScreenshots.length]);

  if (normalizedScreenshots.length === 0) {
    return <div className="screenshot-gallery-placeholder">No screenshots available.</div>
  }

  const handleThumbnailClick = (index) => {
    setSelectedIndex(index);
  };

  const lightboxImage = normalizedScreenshots[lightboxIndex];

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
          {selectedScreenshot && (
            <SafeImage
              id={selectedScreenshot.id}
              width={MAIN_IMAGE_WIDTH}
              quality={MAIN_IMAGE_QUALITY}
              mimeType={selectedScreenshot.type}
              alt="Screenshot principal"
            />
          )}
          <div className="gallery-expand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </div>
        </div>
        {normalizedScreenshots.length > 1 && (
          <div className="gallery-thumbnails">
            {normalizedScreenshots.map((ss, index) => {
              const isSelected = index === selectedIndex;

              return (
                <SafeImage
                  key={ss.id}
                  id={ss.id}
                  width={THUMBNAIL_WIDTH}
                  options={`height=${THUMBNAIL_HEIGHT}&fit=cover`}
                  quality={THUMBNAIL_QUALITY}
                  mimeType={ss.type}
                  alt={`Thumbnail ${index + 1}`}
                  className={isSelected ? 'active' : ''}
                  onClick={() => handleThumbnailClick(index)}
                  loading="lazy"
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div className="gallery-lightbox" onClick={closeLightbox}>
          {/* Progress bar */}
          {autoPlay && (
            <div className="lightbox-progress-bar">
              <div
                className="lightbox-progress-fill"
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

          {/* Auto-play toggle */}
          <button
            className={`lightbox-autoplay ${autoPlay ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setAutoPlay(prev => !prev); }}
            aria-label={autoPlay ? 'Pause autoplay' : 'Start autoplay'}
          >
            {autoPlay ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Image counter */}
          <div className="lightbox-counter">
            {lightboxIndex + 1} / {normalizedScreenshots.length}
          </div>

          {/* Previous button */}
          <button
            className="lightbox-nav lightbox-prev"
            onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
            aria-label="Previous image"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Next button */}
          <button
            className="lightbox-nav lightbox-next"
            onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
            aria-label="Next image"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Main image */}
          <div
            className="lightbox-image-container"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxImage && (
              <SafeImage
                id={lightboxImage.id}
                width={lightboxDimensions.width}
                quality={LIGHTBOX_QUALITY}
                mimeType={lightboxImage.type}
                alt={`Screenshot ${lightboxIndex + 1}`}
              />
            )}
          </div>

          {/* Thumbnails */}
          {normalizedScreenshots.length > 1 && (
            <div className="lightbox-thumbnails" onClick={(e) => e.stopPropagation()}>
              {normalizedScreenshots.map((ss, index) => (
                <div
                  key={ss.id}
                  className={`lightbox-thumb ${index === lightboxIndex ? 'active' : ''}`}
                  onClick={() => { setLightboxIndex(index); setProgress(0); startTimeRef.current = Date.now(); }}
                >
                  <SafeImage
                    id={ss.id}
                    width={THUMBNAIL_WIDTH}
                    options={`height=${THUMBNAIL_HEIGHT}&fit=cover`}
                    quality={THUMBNAIL_QUALITY}
                    mimeType={ss.type}
                    alt={`Thumbnail ${index + 1}`}
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

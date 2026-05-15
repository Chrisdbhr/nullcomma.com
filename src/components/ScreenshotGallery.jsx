import React, { useState } from 'react'
import SafeImage from './SafeImage'

// Definições de tamanho para otimização do Directus
const THUMBNAIL_WIDTH = 100;
const THUMBNAIL_HEIGHT = 60;
const MAIN_IMAGE_WIDTH = 1200;

// Quality settings: lower for thumbnails (smaller files), higher for main image (better quality)
const THUMBNAIL_QUALITY = 40;
const MAIN_IMAGE_QUALITY = 70;

function ScreenshotGallery({ screenshots }) {
  // Normalize screenshots structure to make life easier:
  const normalizedScreenshots = screenshots.map(ss => ({
    id: ss.directus_files_id.id,
    type: ss.directus_files_id.type,
  }));

  // Track selected screenshot by ID and type instead of URL
  const [selectedScreenshot, setSelectedScreenshot] = useState(
    normalizedScreenshots.length > 0 
      ? { id: normalizedScreenshots[0].id, type: normalizedScreenshots[0].type }
      : null
  );

  if (normalizedScreenshots.length === 0) {
    return <div className="screenshot-gallery-placeholder">No screenshots available.</div>
  }

  const handleThumbnailClick = (ss) => {
    setSelectedScreenshot({ id: ss.id, type: ss.type });
  };

  return (
    <div className="screenshot-gallery">
      <div className="gallery-main-image">
        {selectedScreenshot && (
          <SafeImage
            id={selectedScreenshot.id}
            width={MAIN_IMAGE_WIDTH}
            quality={MAIN_IMAGE_QUALITY}
            mimeType={selectedScreenshot.type}
            alt="Screenshot principal"
          />
        )}
      </div>
      {normalizedScreenshots.length > 1 && (
        <div className="gallery-thumbnails">
          {normalizedScreenshots.map((ss) => {
            const isSelected = ss.id === selectedScreenshot?.id;

            return (
              <SafeImage
                key={ss.id}
                id={ss.id}
                width={THUMBNAIL_WIDTH}
                options={`height=${THUMBNAIL_HEIGHT}&fit=cover`}
                quality={THUMBNAIL_QUALITY}
                mimeType={ss.type}
                alt="Thumbnail"
                className={isSelected ? 'active' : ''}
                onClick={() => handleThumbnailClick(ss)}
                loading="lazy"
              />
            );
          })}
        </div>
      )}
    </div>
  )
}

export default ScreenshotGallery

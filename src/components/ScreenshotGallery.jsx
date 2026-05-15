import React, { useState } from 'react'
import { getAssetUrl } from '../utils'

// Definições de tamanho para otimização do Directus
const THUMBNAIL_WIDTH = 200;
const THUMBNAIL_HEIGHT = 120;
const MAIN_IMAGE_WIDTH = 1200;

// O getAssetUrl aplica redimensionamento por padrão.
// O servidor retorna a imagem no formato original (AVIF, WebP, PNG, JPG, etc.).

function ScreenshotGallery({ screenshots }) {
  // Normalize screenshots structure to make life easier:
  const normalizedScreenshots = screenshots.map(ss => ({
    id: ss.directus_files_id.id,
    type: ss.directus_files_id.type,
  }));

  // Inicializa a imagem principal com a URL otimizada de alta resolução
  const [selectedImage, setSelectedImage] = useState(
    normalizedScreenshots.length > 0 
      ? getAssetUrl(normalizedScreenshots[0].id, MAIN_IMAGE_WIDTH, '', normalizedScreenshots[0].type) 
      : null
  );

  if (normalizedScreenshots.length === 0) {
    return <div className="screenshot-gallery-placeholder">No screenshots available.</div>
  }
  
  // O arquivo ID do screenshot atualmente selecionado
  const selectedFileId = selectedImage 
    ? normalizedScreenshots.find(ss => selectedImage.includes(ss.id))?.id
    : null;

  const handleThumbnailClick = (fileId, fileType) => {
    // Ao clicar, define a URL otimizada para visualização principal
    setSelectedImage(getAssetUrl(fileId, MAIN_IMAGE_WIDTH, '', fileType));
  };

  return (
    <div className="screenshot-gallery">
      <div className="gallery-main-image">
        {selectedImage && <img src={selectedImage} alt="Screenshot principal" />}
      </div>
      <div className="gallery-thumbnails">
        {normalizedScreenshots.map((ss) => {
          // Geração da URL da thumbnail otimizada, usando parâmetros de opção para fit/height
          const thumbnailUrl = getAssetUrl(
            ss.id, 
            THUMBNAIL_WIDTH, 
            `height=${THUMBNAIL_HEIGHT}&fit=cover`,
            ss.type // Passa o tipo aqui
          );
          
          // Comparamos o ID do arquivo para saber qual thumbnail está ativa
          const isSelected = ss.id === selectedFileId;
          
          return (
            <img
              key={ss.id}
              src={thumbnailUrl}
              alt="Thumbnail"
              className={isSelected ? 'active' : ''}
              onClick={() => handleThumbnailClick(ss.id, ss.type)} // Passa ID e Type
              loading="lazy" // Otimização de carregamento
            />
          );
        })}
      </div>
    </div>
  )
}

export default ScreenshotGallery
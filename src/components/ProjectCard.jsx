import React from 'react'
import { Link } from 'react-router-dom'
import { getAssetUrl, getHashedColor } from '../utils'
import { normalizeEngineName } from '../utils/textUtils';
import SafeImage from './SafeImage';

// Helper function to find the preferred English translation
const getPreferredTranslation = (translations) => {
  if (!translations || translations.length === 0) return {};
  const enTranslation = translations.find(t => t.language.startsWith('en'));
  if (enTranslation) return enTranslation;
  const ptTranslation = translations.find(t => t.language.startsWith('pt'));
  if (ptTranslation) return ptTranslation;
  return translations[0] || {};
}


function ProjectCard({ project }) {
  // Use preferred translation helper
  const translation = getPreferredTranslation(project.translations);
  const title = translation.title || 'Title Not Available'; 
  
  const cardImageId = project.card_image?.id;
  const cardImageType = project.card_image?.type; 

  let firstLineSynopsis = '';
  if (translation.synopsis) {
    firstLineSynopsis = translation.synopsis
      .split('\n')[0]
      // Remove Markdown headers (#, ##, ###) se estiverem no início da linha
      .replace(/^(#+\s*)/, '')
      .replace(/([*_~]|<br\s*\/?>|\[.*?\]\(.*?\))/g, '')
      .trim();
  }

  const engineName = normalizeEngineName(project.engine);
  const isUnreleased = new Date(project.release_date) > new Date();
  
  // Se project_type for null, padroniza para 'project'
  const projectType = project.project_type || 'project';

  return (
    <Link to={`/project/${project.id}`} className="game-card">
      <div className="game-card-image-container">
        {cardImageId ? (
          <SafeImage
            id={cardImageId}
            mimeType={cardImageType}
            alt={`Cover image of ${title}`}
            className="game-card-image"
          />
        ) : (
          <div className="game-card-image-placeholder">No Image</div>
        )}
        
        {isUnreleased && (
          <div className="unreleased-banner">Coming Soon</div>
        )}
      </div>

      <div className="game-card-content">
        <h3>{title}</h3>

        {firstLineSynopsis && (
          <p className="game-card-synopsis">{firstLineSynopsis}</p>
        )}

        <div className="game-card-tags">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.tags_id}
              className="game-tag"
              style={{
                backgroundColor: '#111',
                color: getHashedColor(tag.tags_id),
              }}
            >
              {tag.tags_id}
            </span>
          ))}
        </div>

        {/* --- FOOTER UPDATED --- */}
        <div className="game-card-footer">
          <div className="game-card-footer-left">
            <span
              className="game-tag"  
              style={{
                backgroundColor: getHashedColor(projectType)
              }}
            >
              {projectType}
            </span>
          </div>

          {project.engine && (
            <span className="engine-name">{project.engine}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
export default ProjectCard
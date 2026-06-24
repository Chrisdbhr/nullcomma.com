import React from 'react'
import { Link } from 'react-router-dom'
import { getHashedColor } from '../utils'
import { getPreferredTranslation } from '../utils/translationUtils';
import SafeImage from './SafeImage';


function ProjectCard({ project, onFilterClick, activeFilter }) {
  const translation = getPreferredTranslation(project.translations);
  const title = translation.title || 'Title Not Available'; 
  
  const cardImageId = project.card_image?.id;
  const cardImageType = project.card_image?.type; 

  let firstLineSynopsis = '';
  if (translation.synopsis) {
    firstLineSynopsis = translation.synopsis
      .split('\n')[0]
      .replace(/^(#+\s*)/, '')
      .replace(/([*_~]|<br\s*\/?>|\[.*?\]\(.*?\))/g, '')
      .trim();
  }

  const isUnreleased = new Date(project.release_date) > new Date();
  
  const projectType = project.project_type || 'project';

  const isActiveTag = (kind, value) =>
    activeFilter?.kind === kind && activeFilter?.value === value;

  const handleTagClick = (e, kind, value) => {
    e.preventDefault();
    e.stopPropagation();
    onFilterClick?.(kind, value, project.id);
  };

  return (
    <Link to={`/project/${project.id}`} className="game-card" data-project-id={project.id}>
      <div className="game-card-image-container">
        {cardImageId ? (
          <SafeImage
            id={cardImageId}
            width={400}
            quality={60}
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
              className={`game-tag${isActiveTag('tag', tag.tags_id) ? ' game-tag-active' : ''}`}
              style={{
                backgroundColor: '#111',
                color: getHashedColor(tag.tags_id),
              }}
              onClick={(e) => handleTagClick(e, 'tag', tag.tags_id)}
            >
              {tag.tags_id}
            </span>
          ))}
        </div>

        <div className="game-card-footer">
          <div className="game-card-footer-left">
            <span
              className={`game-tag${isActiveTag('type', projectType) ? ' game-tag-active' : ''}`}
              style={{
                backgroundColor: getHashedColor(projectType)
              }}
              onClick={(e) => handleTagClick(e, 'type', projectType)}
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
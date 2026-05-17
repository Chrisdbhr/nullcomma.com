import React from 'react';
import { getHashedColor } from '../utils';

function ProjectTypeFilter({ types, excludedTypes, onToggle }) {
  if (types.length <= 1) return null;

  return (
    <div className="project-filter-container fade-in">
      <div className="filter-header">
        <h4>Filter by Project Type:</h4>
        <div className="filter-buttons">
          {types.map((type) => {
            const isExcluded = excludedTypes.includes(type);
            const color = getHashedColor(type);

            return (
              <button
                key={type}
                className={`filter-button ${isExcluded ? 'excluded' : ''}`}
                onClick={() => onToggle(type)}
                style={{
                  '--filter-color': color,
                }}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProjectTypeFilter;
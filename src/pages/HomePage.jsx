import React, { Fragment, useState, useRef } from 'react'
import { useLoaderData } from 'react-router-dom'
import { useReferral } from '../hooks/useReferral'
import { useMasonry } from '../hooks/useMasonry'
import ProjectCard from '../components/ProjectCard'
import BlogFeed from '../components/BlogFeed'
import ContactForm from '../components/ContactForm'
import { baseURL, fieldsQuery } from '../utils'
import { setCmsProjects } from '../utils/cmsCache'
import LauncherCTA from '../components/LauncherCTA'
import { normalizeEngineName } from '../utils/textUtils';
import {
  FaGithub, FaSteam, FaLinkedin,
  FaInstagram, FaYoutube, FaTiktok, FaDiscord
} from 'react-icons/fa'

/**
 * Calculates engine statistics from a list of games.
 * @param {Array} games - List of game objects.
 * @returns {Array} Array of [engineName, count] pairs, sorted alphabetically by engine name.
 */
const getEngineStats = (games) => {
  const stats = games.reduce((acc, game) => {
    const engineName = normalizeEngineName(game.engine);
    acc[engineName] = (acc[engineName] || 0) + 1;
    return acc;
  }, {});
  // Sort alphabetically by engine name
  return Object.entries(stats).sort((a, b) => a[0].localeCompare(b[0]));
};

// 2. EXPORTE O SEU LOADER (que o main.jsx importa)
export async function loader() {
  try {
    const response = await fetch(`${baseURL}/items/projects?${fieldsQuery}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const totalProjects = data.data;
    setCmsProjects(totalProjects);

    // Lógica para extrair tipos de projeto únicos
    const allProjectTypes = new Set();
    totalProjects.forEach(p => {
      const type = p.project_type || 'project';
      allProjectTypes.add(type);
    });
    const uniqueProjectTypes = Array.from(allProjectTypes).sort();

    const totalProjectsCount = totalProjects.length;
    const totalEngineStats = getEngineStats(totalProjects);

    return {
      totalProjects,
      totalProjectsCount,
      totalEngineStats,
      uniqueProjectTypes
    };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return {
      totalProjects: [],
      totalProjectsCount: 0,
      totalEngineStats: [],
      uniqueProjectTypes: []
    };
  }
}

// --- COMPONENTE PRINCIPAL ---
function HomePage() {
  const referral = useReferral();

  // 3. Pegue os dados do loader. Sem loading, sem useEffect!
  const {
    totalProjects,
    totalProjectsCount,
    totalEngineStats,
    uniqueProjectTypes
  } = useLoaderData();

  // Estado para o filtro ativo: null = todos, { kind, value } = filtrado
  const [filter, setFilter] = useState(null);
  const [lastClickedId, setLastClickedId] = useState(null);

  const handleFilterClick = (kind, value, projectId) => {
    if (projectId) setLastClickedId(projectId);
    setFilter(prev =>
      prev?.kind === kind && prev?.value === value ? null : { kind, value }
    );
  };

  const clearFilter = () => {
    setFilter(null);
    if (lastClickedId) {
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-project-id="${lastClickedId}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  };

  const filterProjects = (projects) => {
    if (!filter) return projects;
    return projects.filter(project => {
      if (filter.kind === 'type')
        return (project.project_type || 'project') === filter.value;
      if (filter.kind === 'tag')
        return project.tags?.some(t => t.tags_id === filter.value);
      return true;
    });
  };

  // Year grouping: unifica todos os projetos num grid só, ordenado por data
  const allSortedByDate = [...totalProjects].sort(
    (a, b) => new Date(b.release_date) - new Date(a.release_date)
  );

  const groupedByYear = {};
  allSortedByDate.forEach(p => {
    const year = new Date(p.release_date).getFullYear();
    if (!groupedByYear[year]) groupedByYear[year] = [];
    groupedByYear[year].push(p);
  });
  const years = Object.keys(groupedByYear).sort((a, b) => b - a);

  const currentYear = new Date().getFullYear();

  const totalVisibleProjects = years.reduce((sum, year) => {
    return sum + filterProjects(groupedByYear[year]).length;
  }, 0);

  const projectsHidden = totalProjectsCount - totalVisibleProjects;
  const gridRef = useRef(null);
  useMasonry(gridRef, [filter, totalProjects, years]);

  return (
    <div className="page-content fade-in">

      {/* SEO META TAGS for Home Page */}
      <title>{referral ? 'Null Comma (ChrisJogos.com) - Indie Games & Dev Insights' : 'Null Comma - Indie Games & Dev Insights'}</title>
      <meta name="description" content="Discover indie games, prototypes, and dev insights by Christopher Ravailhe. Unity, C#, and game development experiments." />

      <div className="home-section">
        <BlogFeed />
      </div>

      <LauncherCTA />

      <div className="home-section">
        <div className="home-section-header">
          <h2>
            Games and Projects ({totalVisibleProjects}{totalVisibleProjects !== totalProjectsCount ? `/${totalProjectsCount}` : ''})
            {/* Mensagem de projetos ocultos integrada (Req 2) */}
            {projectsHidden > 0 && (
              <span className="hidden-count-message" style={{ marginLeft: '15px' }}>
                (+{projectsHidden} hidden)
              </span>
            )}
          </h2>
          {totalEngineStats.length > 0 && (
            <div className="engine-stats-total">
              {totalEngineStats.map(([engine, count]) => (
                <span key={engine} className="engine-stat-item">
                  {engine} ({count})
                </span>
              ))}
            </div>
          )}
        </div>

        <div ref={gridRef} className="game-grid">
          {years.map(year => {
            const yearProjects = groupedByYear[year];
            const yearVisible = filterProjects(yearProjects);
            const yearHidden = yearProjects.length - yearVisible.length;

            if (yearVisible.length === 0 && yearHidden === 0) return null;

            return (
              <Fragment key={year}>
                {yearVisible.map((project, i) => (
                  <div key={project.id} className={`game-grid-item${i === 0 ? ' year-first' : ''}`}>
                    {i === 0 && year !== currentYear && <span className="year-marker">{year}</span>}
                    <ProjectCard
                      project={project}
                      onFilterClick={handleFilterClick}
                      activeFilter={filter}
                    />
                  </div>
                ))}
                {yearHidden > 0 && (
                  <div
                    key={`hidden-${year}`}
                    className="game-card hidden-projects-card"
                    onClick={clearFilter}
                  >
                    <div className="hidden-card-content">
                      <h4>+{yearHidden} Hidden from {year}</h4>
                      <p style={{ marginTop: '10px', color: 'var(--color-purple)' }}>
                        Click to show all.
                      </p>
                    </div>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>

        {totalProjectsCount > 0 && totalVisibleProjects === 0 && (
            <p style={{ textAlign: 'center', marginTop: '40px', color: '#a0a0a0' }}>
                No projects found. All are currently hidden by filters.
            </p>
        )}
         {totalProjectsCount === 0 && (
            <p style={{ textAlign: 'center', marginTop: '40px', color: '#a0a0a0' }}>
                No projects registered in the portfolio.
            </p>
        )}
      </div>

      <div className="home-contact-layout">
        <div className="home-contact-left">
          <div className="home-section about-me-card">
            <div className="about-me-card-content">
              <h3>The Developer</h3>
              <p>
                <strong>Christopher Ravailhe</strong> is a Senior C# Developer and QA Test Automation specialist with over 9 years of experience in Unity. He has shipped 25+ games across PC, console, and mobile platforms.
              </p>
              <p>
                Null Comma serves as a hub for his games, prototypes, and technical experiments. The blog section features devlogs, tutorials, and game development insights.
              </p>
              <div className="about-me-card-stats">
                <span className="mini-stat"><strong>9+</strong> Years in Unity</span>
                <span className="mini-stat"><strong>25+</strong> Games Shipped</span>
                <span className="mini-stat">PC · Console · Mobile</span>
              </div>
            </div>
          </div>

          <div className="home-section community-section">
            <div className="community-content">
              <div className="community-info">
                <h3>Community</h3>
                <p>
                  Meet <strong>Concord</strong>! For over 10 years, the community has been playing, working, and talking about life together.
                </p>
                <a href="https://discord.nullcomma.com/" target="_blank" rel="noopener noreferrer" className="community-discord-btn">
                  <FaDiscord /> Join Discord
                </a>
              </div>
              <div className="community-socials">
                <h4>Follow Null Comma</h4>
                <div className="social-links-grid">
                  <a href="https://github.com/Chrisdbhr" target="_blank" rel="noopener noreferrer" title="GitHub"><FaGithub /></a>
                  <a href="https://www.linkedin.com/company/105116562" target="_blank" rel="noopener noreferrer" title="LinkedIn"><FaLinkedin /></a>
                  <a href="https://store.steampowered.com/curator/46087468" target="_blank" rel="noopener noreferrer" title="Steam"><FaSteam /></a>
                  <a href="https://tiktok.com/@nullcomma" target="_blank" rel="noopener noreferrer" title="TikTok"><FaTiktok /></a>
                  <a href="https://www.instagram.com/nullcomma" target="_blank" rel="noopener noreferrer" title="Instagram"><FaInstagram /></a>
                  <a href="https://www.youtube.com/@chrisjogos" target="_blank" rel="noopener noreferrer" title="YouTube"><FaYoutube /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="home-section">
          <ContactForm />
        </div>
      </div>
    </div>
  )
}

export default HomePage
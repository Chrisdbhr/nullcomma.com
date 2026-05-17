import React, { useState } from 'react'
import { useLoaderData } from 'react-router-dom'
import ProjectCard from '../components/ProjectCard'
import BlogFeed from '../components/BlogFeed'
import ContactForm from '../components/ContactForm'
import { baseURL, fieldsQuery } from '../utils'
import LauncherCTA from '../components/LauncherCTA'
import ProjectTypeFilter from '../components/ProjectTypeFilter'
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

    const now = new Date();

    const unreleasedProjects = totalProjects
      .filter(g => new Date(g.release_date) > now)
      .sort((a, b) => new Date(a.release_date) - new Date(b.release_date));

    const pastProjects = totalProjects
      .filter(g => new Date(g.release_date) <= now)
      .sort((a, b) => new Date(b.release_date) - new Date(a.release_date));

    const groupedReleasedProjects = pastProjects.reduce((acc, project) => {
      const year = new Date(project.release_date).getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(project);
      return acc;
    }, {});

    // Lógica para extrair tipos de projeto únicos
    const allProjectTypes = new Set();
    totalProjects.forEach(p => {
      // Se project_type for null, padroniza para 'project'
      const type = p.project_type || 'project';
      allProjectTypes.add(type);
    });
    const uniqueProjectTypes = Array.from(allProjectTypes).sort();

    const totalProjectsCount = totalProjects.length;
    const totalEngineStats = getEngineStats(totalProjects);
    const sortedYears = Object.keys(groupedReleasedProjects).sort((a, b) => b - a);

    // O loader retorna um objeto com tudo que a página precisa
    return {
      totalProjects,
      unreleasedProjects,
      groupedReleasedProjects,
      totalProjectsCount,
      totalEngineStats,
      sortedYears,
      uniqueProjectTypes // Retorna os tipos únicos
    };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return {
      totalProjects: [],
      unreleasedProjects: [],
      groupedReleasedProjects: {},
      totalProjectsCount: 0,
      totalEngineStats: [],
      sortedYears: [],
      uniqueProjectTypes: []
    };
  }
}

// --- COMPONENTE PRINCIPAL ---
function HomePage() {
  // 3. Pegue os dados do loader. Sem loading, sem useEffect!
  const {
    totalProjectsCount,
    totalEngineStats,
    unreleasedProjects: initialUnreleased,
    groupedReleasedProjects: initialGrouped,
    sortedYears,
    uniqueProjectTypes
  } = useLoaderData();

  // Estado para os tipos de projeto que DEVEM ser excluídos
  const [excludedTypes, setExcludedTypes] = useState([]);

  // Função para alternar o estado de um tipo de projeto
  const handleToggleType = (type) => {
    setExcludedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type); // Incluir (remover da lista de exclusão)
      } else {
        return [...prev, type]; // Excluir (adicionar à lista de exclusão)
      }
    });
  };

  // NOVO: Função para remover uma lista específica de exclusões (o que o usuário clicou no card)
  const handleRemoveExclusions = (typesToRemove) => {
    if (typesToRemove && typesToRemove.length > 0) {
      setExcludedTypes(prev => prev.filter(type => !typesToRemove.includes(type)));
    }
  };

  // 5. Função de filtro: Aplica a lógica de exclusão
  const filterProjects = (projects) => {
    if (excludedTypes.length === 0) return projects;

    return projects.filter(project => {
      const type = project.project_type || 'project';
      return !excludedTypes.includes(type);
    });
  };

  // 6. Aplicar o filtro nos projetos e calcular quantos foram escondidos

  // Projetos futuros
  const filteredUnreleasedProjects = filterProjects(initialUnreleased);

  // Projetos passados (Agrupados)
  const filteredGroupedReleasedProjects = {};
  let totalVisibleProjects = filteredUnreleasedProjects.length;

  sortedYears.forEach(year => {
    const filtered = filterProjects(initialGrouped[year]);
    if (filtered.length > 0) {
      filteredGroupedReleasedProjects[year] = filtered;
    }
    // Sempre contamos os visíveis para o total
    totalVisibleProjects += filtered.length;
  });

  // HELPER: Calcula quais tipos excluídos são relevantes para a lista de projetos fornecida
  const getRelevantExcludedTypes = (initialProjects) => {
      // Cria uma lista de projetos que deveriam estar lá, mas foram excluídos
      const relevantTypes = new Set();
      initialProjects.forEach(p => {
          const type = p.project_type || 'project';
          if (excludedTypes.includes(type)) {
              relevantTypes.add(type);
          }
      });
      return Array.from(relevantTypes).sort();
  };

  const projectsHidden = totalProjectsCount - totalVisibleProjects;
  const showHiddenCard = excludedTypes.length > 0;

  return (
    <div className="page-content fade-in">

      {/* SEO META TAGS for Home Page */}
      <title>Null Comma — Indie Games & Dev Insights</title>
      <meta name="description" content="Discover indie games, prototypes, and dev insights by Christopher Ravailhe. Unity, C#, and game development experiments." />

      <div className="home-section">
        <BlogFeed />
      </div>

      <div className="filter-launcher-grid">
        <ProjectTypeFilter
          types={uniqueProjectTypes}
          excludedTypes={excludedTypes}
          onToggle={handleToggleType}
        />
        <LauncherCTA />
      </div>

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

        {/* Renderização dos Projetos */}

        {/* Seção Próximos Lançamentos */}
        {(initialUnreleased.length > 0) && (
          <section className="year-group">
            <h3 className="year-title upcoming-title">Upcoming Releases</h3>

            {/* Caso A: Todos ocultos */}
            {filteredUnreleasedProjects.length === 0 && initialUnreleased.length > 0 ? (
               <p style={{ textAlign: 'center', color: 'var(--color-grey)', padding: '20px 0' }}>
                 All {initialUnreleased.length} upcoming projects have been hidden by filters.
               </p>
            ) : (
            // Caso B/C: Projetos visíveis
            <div className="game-grid">
              {filteredUnreleasedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}

              {/* Card de Projetos Ocultos (Unreleased) */}
              {initialUnreleased.length > filteredUnreleasedProjects.length && showHiddenCard && (() => {
                const projectsHiddenInUnreleased = initialUnreleased.length - filteredUnreleasedProjects.length;
                const relevantExcludedTypes = getRelevantExcludedTypes(initialUnreleased);
                const excludedTypesList = relevantExcludedTypes.join(', ');

                return (
                  <div
                    className="game-card hidden-projects-card"
                    onClick={() => handleRemoveExclusions(relevantExcludedTypes)}
                  >
                    <div className="hidden-card-content">
                      <h4>+{projectsHiddenInUnreleased} Hidden Projects</h4>
                      <p>
                        Hidden by: <strong>{excludedTypesList}</strong>.
                      </p>
                      <p style={{ marginTop: '10px', color: 'var(--color-purple)' }}>
                         Click to re-enable these types.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          </section>
        )}

        {/* Seção Projetos Lançados (Agrupados por Ano) */}
        {sortedYears.map((year) => {
          const initialYearProjects = initialGrouped[year];
          // Garante que filteredYearProjects seja um array, mesmo que vazio
          const filteredYearProjects = filteredGroupedReleasedProjects[year] || [];

          const projectsHiddenInYear = initialYearProjects.length - filteredYearProjects.length;
          const allProjectsHidden = projectsHiddenInYear === initialYearProjects.length;

          // Se a lista inicial tem projetos, mas todos foram filtrados (Req 3, Caso A)
          if (allProjectsHidden && initialYearProjects.length > 0) {
            return (
              <section key={year} className="year-group">
                <div className="home-section-header">
                  <h3 className="year-title">{year}</h3>
                </div>
                <p style={{ textAlign: 'center', color: 'var(--color-grey)', padding: '20px 0' }}>
                  All {initialYearProjects.length} projects from {year} have been hidden by filters.
                </p>
              </section>
            );
          }

          // Se não houver projetos visíveis, não renderiza a seção
          if (filteredYearProjects.length === 0) return null;

          const yearEngineStats = getEngineStats(filteredYearProjects);

          // Cálculo dos tipos relevantes para este grupo
          const relevantExcludedTypes = getRelevantExcludedTypes(initialYearProjects);
          const excludedTypesList = relevantExcludedTypes.join(', ');

          return (
            <section key={year} className="year-group">
              <div className="home-section-header">
                <h3 className="year-title">{year}</h3>
                <div className="engine-stats-year">
                  {yearEngineStats.map(([engine, count]) => (
                    <span key={engine} className="engine-stat-item-year">
                      {engine} ({count})
                    </span>
                  ))}
                </div>
              </div>

              <div className="game-grid">
                {filteredYearProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}

                {/* Card de Projetos Ocultos (Req 3, Caso B) */}
                {projectsHiddenInYear > 0 && showHiddenCard && (
                  <div
                    className="game-card hidden-projects-card"
                    onClick={() => handleRemoveExclusions(relevantExcludedTypes)} // Use specific handler
                  >
                    <div className="hidden-card-content">
                      <h4>+{projectsHiddenInYear} Hidden Projects</h4>
                      <p>
                        Hidden by: <strong>{excludedTypesList}</strong>.
                      </p>
                      <p style={{ marginTop: '10px', color: 'var(--color-purple)' }}>
                         Click to re-enable these types.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}

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
        <div className="home-section">
          <ContactForm />
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
              <a href="https://www.linkedin.com/in/chrisdbhr" target="_blank" rel="noopener noreferrer" title="LinkedIn"><FaLinkedin /></a>
              <a href="https://store.steampowered.com/curator/44885415" target="_blank" rel="noopener noreferrer" title="Steam"><FaSteam /></a>
              <a href="https://tiktok.com/@nullcomma" target="_blank" rel="noopener noreferrer" title="TikTok"><FaTiktok /></a>
              <a href="https://www.instagram.com/nullcomma" target="_blank" rel="noopener noreferrer" title="Instagram"><FaInstagram /></a>
              <a href="https://www.youtube.com/@chrisjogos" target="_blank" rel="noopener noreferrer" title="YouTube"><FaYoutube /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
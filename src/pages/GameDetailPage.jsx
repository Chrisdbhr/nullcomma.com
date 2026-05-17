import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { baseURL, fieldsQuery, getHashedColor, getAssetUrl, formatDate } from '../utils'
import ScreenshotGallery from '../components/ScreenshotGallery'
import DownloadButton from '../components/DownloadButton'
import ReactMarkdown from 'react-markdown'
import { CodeBlock } from '../components/CodeBlock';
import SafeImage from '../components/SafeImage';
import { getPreferredTranslation } from '../utils/translationUtils';

function GameDetailPage() {
  const { projectId } = useParams()
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (!projectId) return;

    // --- 1. Busca os dados do Jogo ---
    const fetchGame = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${baseURL}/items/projects/${projectId}?${fieldsQuery}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setProject(data.data);
      } catch {
        console.error("Error fetching game");
        setProject(null);
      }
    };

    const loadAllData = async () => {
      setLoading(true);
      await fetchGame();
      setLoading(false);
    }

    loadAllData();

  }, [projectId]);

  if (loading) {
    return <div className="page-content"><h2>Loading...</h2></div>;
  }

  if (!project) {
    return (
      <div className="page-content fade-in">
        <h2>Game Not Found</h2>
        <Link to="/" className="button-primary">
          &larr; Go back to Home
        </Link>
      </div>
    )
  }

  const translation = getPreferredTranslation(project.translations);

  // SEO Meta Calculation
  const cardImageId = project.card_image?.id;
  const cardImageType = project.card_image?.type;
  const imageUrl = getAssetUrl(cardImageId, 800, '', cardImageType, 70);

  const title = translation.title || 'Title Not Available'; // Define title for meta tags

  const description = translation.synopsis
    ? translation.synopsis.substring(0, 155).replace(/(\r\n|\n|\r|#|!|\[|\]|\*)/gm, " ").trim() + "..."
    : `${title} — Null Comma. Find out more about this game/project.`;

  const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
      const videoUrl = new URL(url);
      if (videoUrl.hostname.includes('youtube.com')) {
        return `https://www.youtube.com/embed/${videoUrl.searchParams.get('v')}`;
      }
      return url;
    } catch {
      return url;
    }
  }

  const trailerEmbedUrl = getEmbedUrl(project.trailer_url);

  // Filter only published related posts
  const relatedPosts = project.related_posts?.filter(post => post.post_id.status === 'published') || [];

  // Use Steam screenshots when available, fall back to Directus uploads
  const galleryScreenshots = project.steam_screenshots?.length > 0
    ? project.steam_screenshots
    : project.screenshots;

  // Prepend trailer as first gallery slide when available
  const galleryItems = trailerEmbedUrl
    ? [{ type: 'video', url: trailerEmbedUrl, title: 'Trailer' }, ...galleryScreenshots]
    : galleryScreenshots;

  return (
    <div className="page-content game-detail-page fade-in">
      {/* SEO META TAGS */}
      <title>{`${title} - Null Comma`}</title>
      <meta name="description" content={description} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      {imageUrl && <meta property="og:image" content={imageUrl} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}

      <button onClick={() => navigate('/')} className="button-back">
        &larr; Go Back
      </button>
      <h2 className="game-title">{translation.title}</h2>

      <div className="game-detail-layout">
        <div className="game-detail-main">

          <ScreenshotGallery screenshots={galleryItems} />

          {project.steam_id && (
            <div className="steam-widget-container">
              <iframe
                src={`https://store.steampowered.com/widget/${project.steam_id}/`}
                frameBorder="0"
                width="100%"
                height="190"
                title="Steam Widget"
              ></iframe>
            </div>
          )}

          <div className="game-synopsis">
            <ReactMarkdown
              components={{
                code: CodeBlock, // Renderiza código usando o componente CodeBlock
              }}
            >
              {translation.synopsis}
            </ReactMarkdown>
          </div>

          {/* Related Posts Section */}
          {relatedPosts.length > 0 && (
            <div className="github-readme-box">
              <h3>Related Articles</h3>
              <div className="blog-post-grid">
                {relatedPosts.map((post) => {
                  const coverImageId = post.post_id.cover_image?.id;
                  const coverImageType = post.post_id.cover_image?.type;

                  return (
                    <Link
                      key={post.post_id.id}
                      to={`/blog/${post.post_id.id}`}
                      className="blog-post-card"
                    >
                      <div className="blog-post-image-container">
                        {coverImageId ? (
                          <SafeImage
                            id={coverImageId}
                            width={400}
                            options="height=225&fit=cover"
                            mimeType={coverImageType}
                            alt={`Cover image of ${post.post_id.title}`}
                          />
                        ) : (
                          <div className="blog-post-image-placeholder"></div>
                        )}
                      </div>
                      <div className="blog-post-content">
                        <h4>{post.post_id.title}</h4>
                        <span className="blog-post-date">{formatDate(post.post_id.date_published)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        <aside className="game-detail-sidebar">

          {project.executable_path ? (
            // 1. Se tem executável, mostra o botão de download
            <DownloadButton project={project} />
          ) : (
            // 2. Senão, checamos as outras opções:
            //    Se NÃO tem web, NEM Google, NEM Apple, E NEM GITHUB...
            (!project.web_version_url && !project.google_play_url && !project.app_store_url && !project.github_url) ? (
              // ...então o jogo está realmente "Em breve"
              <button className="button-primary button-disabled" disabled>
                Coming Soon
              </button>
            ) : (
              // ...se TIVER qualquer um desses outros links, não mostramos nada aqui,
              // pois os links já vão aparecer nos blocos abaixo.
              null
            )
          )}

          {/* 4. LINKS ADICIONADOS DE VOLTA (com base no turno anterior) */}
          <div className="game-links">
            {/* Link de Jogar Online */}
            {project.web_version_url && (
              <a
                href={project.web_version_url}
                target="_blank"
                rel="noopener noreferrer"
                className="button-secondary button-web"
              >
                <i className="fas fa-play"></i> Play Now (Web)
              </a>
            )}

            {/* Link do Código Fonte (GitHub) */}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="button-secondary button-github"
              >
                <i className="fab fa-github"></i> Source Code
              </a>
            )}

            {(project.project_type === 'game') && (
              <Link to={`/presskit/${project.id}`} className="button-secondary button-presskit">
                <i className="fas fa-newspaper"></i> Press Kit
              </Link>
            )}
          </div>

          {/* Links das Lojas de Aplicativo */}
          {(project.google_play_url || project.app_store_url) && (
            <div className="sidebar-info-box">
              <div className="game-store-links">
                {project.google_play_url && (
                  <a
                    href={project.google_play_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-secondary button-googleplay"
                  >
                    <i className="fab fa-google-play"></i> Google Play
                  </a>
                )}
                {project.app_store_url && (
                  <a
                    href={project.app_store_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-secondary button-appstore"
                  >
                    <i className="fab fa-apple"></i> App Store
                  </a>
                )}
              </div>
            </div>
          )}

          {/* O restante dos seus blocos de Detalhes e Tags */}
          <div className="sidebar-info-box">
            <h4>Details</h4>
            {project.engine && (
              <p><strong>Engine:</strong> {project.engine}</p>
            )}
            {project.release_date && (
              <p><strong>Release Date:</strong> {formatDate(project.release_date)}</p>
            )}
            {translation.playtime && (
              <p><strong>Playtime:</strong> {translation.playtime}</p>
            )}

            {translation.rating_quote && (
              <blockquote className="rating-quote">
                "{translation.rating_quote}"
              </blockquote>
            )}
          </div>

          {/* Only show tags section if there are tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="sidebar-info-box">
              <h4>Tags</h4>
              <div className="game-detail-tags">
                {project.tags.map((tag) => (
                  <span
                    key={tag.tags_id}
                    className="game-tag"
                    style={{
                      background: getHashedColor(tag.tags_id),
                    }}
                  >
                    {tag.tags_id}
                  </span>
                ))}
              </div>
            </div>
          )}

        </aside>
      </div>
    </div>
  )
}

export default GameDetailPage
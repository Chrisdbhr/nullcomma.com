import React, { useMemo } from 'react'
import { useLoaderData, Link, useNavigate } from 'react-router-dom'
import { baseURL, fieldsQuery, getHashedColor, getAssetUrl, formatDate } from '../utils'
import ScreenshotGallery from '../components/ScreenshotGallery'
import DownloadButton from '../components/DownloadButton'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import { CodeBlock } from '../components/CodeBlock';
import SafeImage from '../components/SafeImage';
import { getPreferredTranslation } from '../utils/translationUtils';
import LazyEmbed from '../components/LazyEmbed';

export async function loader({ params }) {
  const response = await fetch(`${baseURL}/items/projects/${params.projectId}?${fieldsQuery}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  return data.data;
}

function MarkdownImg({ src, alt, ...props }) {
  return (
    <img
      src={src}
      alt={alt || ''}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}

function GameDetailPage() {
  const project = useLoaderData()
  const navigate = useNavigate()

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

  const translation = getPreferredTranslation(project.translations)

  const cardImageId = project.card_image?.id
  const cardImageType = project.card_image?.type
  const imageUrl = getAssetUrl(cardImageId, 800, '', cardImageType, 70)

  const title = translation.title || 'Title Not Available'

  const description = translation.synopsis
    ? translation.synopsis.substring(0, 155).replace(/(\r\n|\n|\r|#|!|\[|\]|\*)/gm, " ").trim() + "..."
    : `${title} — Null Comma. Find out more about this game/project.`

  const getEmbedUrl = (url) => {
    if (!url) return null
    try {
      const videoUrl = new URL(url)
      if (videoUrl.hostname.includes('youtube.com')) {
        return `https://www.youtube.com/embed/${videoUrl.searchParams.get('v')}`
      }
      return url
    } catch {
      return url
    }
  }

  const trailerEmbedUrl = getEmbedUrl(project.trailer_url)

  const relatedPosts = useMemo(
    () => (project.related_posts?.filter(post => post.post_id.status === 'published') || []),
    [project]
  )

  const galleryScreenshots = project.steam_screenshots?.length > 0
    ? project.steam_screenshots
    : project.screenshots

  const galleryItems = trailerEmbedUrl
    ? [{ type: 'video', url: trailerEmbedUrl, title: 'Trailer' }, ...(galleryScreenshots || [])]
    : (galleryScreenshots || [])

  return (
    <div className="page-content game-detail-page fade-in">
      <title>{`${title} - Null Comma`}</title>
      <meta name="description" content={description} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      {imageUrl && <meta property="og:image" content={imageUrl} />}

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
              <LazyEmbed
                src={`https://store.steampowered.com/widget/${project.steam_id}/`}
                height="190"
                title="Steam Widget"
              />
            </div>
          )}

          <div className="game-synopsis">
            <ReactMarkdown
              rehypePlugins={[rehypeRaw, rehypeSlug]}
              components={{
                code: CodeBlock,
                img: MarkdownImg,
              }}
            >
              {translation.synopsis}
            </ReactMarkdown>
          </div>

          {relatedPosts.length > 0 && (
            <div className="github-readme-box">
              <h3>Related Articles</h3>
              <div className="blog-post-grid">
                {relatedPosts.map((post) => {
                  const coverImageId = post.post_id.cover_image?.id
                  const coverImageType = post.post_id.cover_image?.type

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
                  )
                })}
              </div>
            </div>
          )}

        </div>

        <aside className="game-detail-sidebar">

          {project.executable_path ? (
            <DownloadButton project={project} />
          ) : (
            (!project.web_version_url && !project.google_play_url && !project.app_store_url && !project.github_url) ? (
              <button className="button-primary button-disabled" disabled>
                Coming Soon
              </button>
            ) : null
          )}

          <div className="game-links">
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

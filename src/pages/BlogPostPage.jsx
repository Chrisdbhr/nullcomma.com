import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import TableOfContents from '../components/TableOfContents'
import { getReadingTime, extractToc } from '../utils/textUtils'
import { getAssetUrl, baseURL, getHashedColor, formatDate } from '../utils'
import { CodeBlock } from '../components/CodeBlock'
import ProjectCard from '../components/ProjectCard'
import SafeImage from '../components/SafeImage'


function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [tocItems, setTocItems] = useState([])
  const [readingTime, setReadingTime] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      const PROJECT_CARD_REQUIRED_FIELDS = [
        'id', 'status', 'release_date', 'engine', 'project_type',
        'card_image.id', 'card_image.type',
        'translations.*',
        'tags.tags_id',
      ]

      const RELATED_PROJECT_FIELDS = PROJECT_CARD_REQUIRED_FIELDS
        .map(field => `related_projects.projects_id.${field}`)
        .join(',')

      const API_URL = `${baseURL}/items/blog_posts/${slug}?fields=id,title,date_published,content,cover_image.id,cover_image.type,tags.tags_id,${RELATED_PROJECT_FIELDS}`

      try {
        setLoading(true)
        const response = await fetch(API_URL)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const data = await response.json()

        if (data.data) {
          setPost(data.data)
          setReadingTime(getReadingTime(data.data.content))
          setTocItems(extractToc(data.data.content))
        } else {
          throw new Error("Post not found")
        }
      } catch (error) {
        console.error("Error fetching post:", error)
        setPost(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  const imageUrl = post?.cover_image
    ? getAssetUrl(post.cover_image.id, 1000, '', post.cover_image.type)
    : null

  const pubDate = post ? formatDate(post.date_published) : ''

  const description = post?.content
    ? post.content.substring(0, 155).replace(/(\r\n|\n|\r|#|!|\[|\]|\*)/gm, " ").trim() + "..."
    : "Read this post on Null Comma."

  const relatedProjects = useMemo(() => {
    if (!post?.related_projects) return []
    return post.related_projects
      .map(link => link.projects_id)
      .filter(project => {
        if (!project) return false
        const status = project.status
        return import.meta.env.DEV
          ? status === 'published' || status === 'draft'
          : status === 'published'
      })
  }, [post])

  const MarkdownImg = useCallback(({ src, alt, ...props }) => {
    return (
      <img
        src={src}
        alt={alt || ''}
        loading="lazy"
        decoding="async"
        {...props}
      />
    )
  }, [])

  if (loading) {
    return (
      <>
        <title>Loading Post... - Null Comma</title>
        <div className="blog-post-layout">
          <article className="blog-post-detail">
            <header className="blog-post-header skeleton-header">
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-meta" />
              <div className="skeleton skeleton-cover" />
            </header>
            <div className="blog-post-body">
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text short" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text short" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text" />
            </div>
          </article>
          <aside className="blog-post-sidebar-container">
            <div className="skeleton skeleton-toc" />
          </aside>
        </div>
      </>
    )
  }

  if (!post) {
    return (
      <>
        <title>Post Not Found - Null Comma</title>
        <p>Post not found.</p>
      </>
    )
  }

  return (
    <div className="blog-post-layout">

      <title>{`${post.title} - Null Comma`}</title>
      <meta name="description" content={description} />

      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      {imageUrl && <meta property="og:image" content={imageUrl} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      <meta name="fediverse:creator" content="@nullcomma@mastodon.gamedev.place" />


      <article className="blog-post-detail">
        <header className="blog-post-header">
          <h1>{post.title}</h1>
          <div className="blog-post-meta">
            <span className="blog-post-date">{pubDate}</span>
            {readingTime > 0 && (
              <span className="blog-post-reading-time">
                &bull; {readingTime} min read
              </span>
            )}
          </div>

          {(post.tags && post.tags.length > 0) && (
            <div className="blog-post-tags">
              {post.tags.map(tag => {
                const tagId = tag.tags_id || tag
                const color = getHashedColor(tagId)
                return (
                  <span
                    key={tagId}
                    className="game-tag"
                    style={{
                      background: '#222',
                      color: color
                    }}
                  >
                    {tagId}
                  </span>
                )
              })}
            </div>
          )}

          {post.cover_image && (
            <SafeImage
              id={post.cover_image.id}
              width={1000}
              quality={75}
              mimeType={post.cover_image.type}
              alt={`Cover image of ${post.title}`}
              fetchpriority="high"
            />
          )}
        </header>

        <div className="blog-post-body">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw, rehypeSlug]}
            components={{
              code: CodeBlock,
              img: MarkdownImg,
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {relatedProjects.length > 0 && (
          <div className="github-readme-box">
            <h3>Related Projects</h3>
            <div className="game-grid">
              {relatedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

      </article>

      <aside className="blog-post-sidebar-container">
        <TableOfContents items={tocItems} />
      </aside>
    </div>
  )
}

export default BlogPostPage

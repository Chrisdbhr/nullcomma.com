import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import TableOfContents from '../components/TableOfContents'
import { getReadingTime, extractToc } from '../utils/textUtils'
import { getAssetUrl, baseURL, getHashedColor } from '../utils'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ProjectCard from '../components/ProjectCard'
import SafeImage from '../components/SafeImage'

// Component for rendering code blocks with syntax highlighting
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  return !inline && match ? (
    <SyntaxHighlighter
      {...props}
      style={dracula}
      language={match[1]}
      PreTag="div"
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code {...props} className={className}>
      {children}
    </code>
  );
};


function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [tocItems, setTocItems] = useState([]);
  const [readingTime, setReadingTime] = useState(0);
  const [loading, setLoading] = useState(true); // Fixed: useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      
      // Fields required by ProjectCard component on the related project object
      const PROJECT_CARD_REQUIRED_FIELDS = [
        'id', 'status', 'release_date', 'engine', 'project_type',
        'card_image.id', 'card_image.type',
        'translations.*',
        'tags.tags_id',
      ];
      
      // Prefix all required fields with 'related_projects.projects_id.'
      const RELATED_PROJECT_FIELDS = PROJECT_CARD_REQUIRED_FIELDS
        .map(field => `related_projects.projects_id.${field}`)
        .join(',');
      
      const API_URL = `${baseURL}/items/blog_posts/${slug}?fields=id,title,date_published,content,cover_image.id,cover_image.type,tags,${RELATED_PROJECT_FIELDS}`
      
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        if (data.data) {
          setPost(data.data);
          setReadingTime(getReadingTime(data.data.content));
          setTocItems(extractToc(data.data.content));
        } else {
          throw new Error("Post not found");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <>
        <title>Loading Post... - Null Comma</title>
        <p>Loading post...</p>
      </>
    );
  }
  
  if (!post) {
    return (
      <>
        <title>Post Not Found - Null Comma</title>
        <p>Post not found.</p>
      </>
    );
  }

  const imageUrl = post.cover_image 
    ? getAssetUrl(post.cover_image.id, 1000, '', post.cover_image.type) // Otimizado para 1000px de largura
    : null;
    
  const pubDate = new Date(post.date_published || Date.now()).toLocaleDateString('pt-BR');

  const description = post.content
    ? post.content.substring(0, 155).replace(/(\r\n|\n|\r|#|!|\[|\]|\*)/gm, " ").trim() + "..."
    : "Read this post on Null Comma.";

  // Extract and filter related projects based on environment status requirements
  const relatedProjects = (post.related_projects || [])
    .map(link => link.projects_id)
    .filter(project => {
      if (!project) return false;
      const status = project.status;
      
      if (import.meta.env.DEV) {
        return status === 'published' || status === 'draft';
      } else {
        return status === 'published';
      }
    });


  return (
    <div className="blog-post-layout">
      
      <title>{`${post.title} - Null Comma`}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph (para Discord, Facebook, etc.) */}
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      
      {/* Twitter Cards (para o Twitter) */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}


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

          {/* Display Blog Post Tags */}
          {(post.tags && post.tags.length > 0) && (
            <div className="blog-post-tags">
              {post.tags.map(tag => {
                const tagId = tag;
                const color = getHashedColor(tagId);
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
                );
              })}
            </div>
          )}

          {post.cover_image && (
                          <SafeImage
                            id={coverImageId}
                            width={400}
                            quality={60}
                            options="height=225&fit=cover"
                            mimeType={coverImageType}
                            alt={`Cover image of ${post.post_id.title}`}
                          />
          )}
        </header>
        
        <div className="blog-post-body">
          <ReactMarkdown
            rehypePlugins={[
              rehypeRaw, 
              rehypeSlug 
            ]}
            components={{
              code: CodeBlock, // Renderiza código usando o componente CodeBlock
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Related Projects Section */}
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
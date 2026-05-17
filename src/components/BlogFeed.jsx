import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { baseURL } from '../utils'
import SafeImage from './SafeImage'

const getFilter = () => {
  return import.meta.env.DEV
    ? "filter[status][_in]=published,draft"
    : "filter[status][_eq]=published";
}

const API_URL = `${baseURL}/items/blog_posts?fields=id,title,date_published,cover_image.id,cover_image.type&${getFilter()}&sort=-date_published&limit=4`

function BlogFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        const feedPosts = data.data.map((item) => {
          return {
            title: item.title || "No Title",
            link: `/blog/${item.id}`,
            pubDate: new Date(item.date_published || Date.now()).toLocaleDateString('en-US'),
            coverImageId: item.cover_image?.id || null,
            coverImageType: item.cover_image?.type || '',
          };
        });
        setPosts(feedPosts);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="blog-feed-container">
      <h3>Latest from the Blog</h3>
      {loading && (
        <div className="blog-post-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="blog-post-card blog-post-card-skeleton">
              <div className="blog-post-image-placeholder"></div>
              <div className="blog-post-content">
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line skeleton-date"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="blog-post-grid">
        {posts.map((post) => (
          <Link
            key={post.link}
            to={post.link}
            className="blog-post-card"
          >
            <div className="blog-post-image-container">
              {post.coverImageId ? (
                <SafeImage
                  id={post.coverImageId}
                  width={400}
                  quality={60}
                  options="height=225&fit=cover"
                  mimeType={post.coverImageType}
                  alt={`Cover image of ${post.title}`}
                />
              ) : (
                <div className="blog-post-image-placeholder"></div>
              )}
            </div>
            <div className="blog-post-content">
              <h4>{post.title}</h4>
              <span className="blog-post-date">{post.pubDate}</span>
            </div>
          </Link>
        ))}
      </div>

      <Link to="/blog" className="button-secondary blog-view-all">
        View all posts &rarr;
      </Link>
    </div>
  )
}

export default BlogFeed
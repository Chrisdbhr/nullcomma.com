import React, { useState, useEffect } from 'react'
import { Link, useLoaderData } from 'react-router-dom'
import { getAssetUrl, baseURL } from '../utils'
import SafeImage from '../components/SafeImage'

// 2. Exporte o loader
export async function loader() {
  const filter = import.meta.env.DEV
    ? "filter[status][_in]=published,draft"
    : "filter[status][_eq]=published";

  const API_URL = `${baseURL}/items/blog_posts?fields=id,title,date_published,cover_image.id,cover_image.type&${filter}&sort=-date_published`

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    const allPosts = data.data.map((item) => {
      return {
        title: item.title || "No Title",
        link: `/blog/${item.id}`,
        pubDate: new Date(item.date_published || Date.now()).toLocaleDateString('pt-BR'),
        coverImageId: item.cover_image?.id || null,
        coverImageType: item.cover_image?.type || '',
      };
    });
    return allPosts;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

function BlogListPage() {
  const posts = useLoaderData();

  return (
    <>
      <title>Blog - Null Comma</title>
      <meta name="description" content="Articles and devlogs by Christopher Ravailhe on Null Comma. Game development, Unity, C#, and more." />
      <meta property="og:title" content="Blog - Null Comma" />
      <meta property="og:description" content="Articles and devlogs by Christopher Ravailhe on Null Comma. Game development, Unity, C#, and more." />

      <div className="blog-list-page">
        <h2>Blog</h2>
        <p>Articles and devlogs about Null Comma projects.</p>

        <div className="blog-post-grid">
          {posts.map((post, index) => (
            <Link
              key={index}
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
      </div>
    </>
  )
}

export default BlogListPage
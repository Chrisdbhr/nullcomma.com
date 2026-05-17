import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BlogPostPage from '../../pages/BlogPostPage';

const mockPost = {
  id: 'showcasing-automated-testing-in-unity',
  title: 'Showcasing Automated Testing in Unity',
  date_published: '2024-07-20T10:00:00Z',
  content: '# Introduction\n\nThis is a test post.',
  cover_image: { id: 'cover-img-1', type: 'image/avif' },
  tags: [{ tags_id: 'testing' }, { tags_id: 'unity' }],
  related_projects: [],
};

function renderWithRouter(slug) {
  return render(
    <MemoryRouter initialEntries={[`/blog/${slug}`]}>
      <Routes>
        <Route path="/blog/:slug" element={<BlogPostPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('BlogPostPage', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockPost }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the post cover image without throwing ReferenceError', async () => {
    renderWithRouter('showcasing-automated-testing-in-unity');

    await waitFor(() => {
      const h1Elements = screen.getAllByText('Showcasing Automated Testing in Unity');
      expect(h1Elements.length).toBeGreaterThan(0);
    });

    const imgElement = document.querySelector('img, picture');
    expect(imgElement).not.toBeNull();
  });

  it('should render correctly when cover_image is null', async () => {
    const postWithoutCover = {
      ...mockPost,
      cover_image: null,
    };
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: postWithoutCover }),
      })
    );

    renderWithRouter('post-without-cover');

    await waitFor(() => {
      const h1Elements = screen.getAllByText('Showcasing Automated Testing in Unity');
      expect(h1Elements.length).toBeGreaterThan(0);
    });

    const imgElement = document.querySelector('.blog-post-header img, .blog-post-header picture');
    expect(imgElement).toBeNull();
  });

  it('should render tags from M2M format without crashing', async () => {
    renderWithRouter('showcasing-automated-testing-in-unity');

    await waitFor(() => {
      expect(screen.getByText('testing')).toBeTruthy();
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loader as blogListPageLoader } from '../../pages/BlogListPage';
import { baseURL } from '../../utils';

const mockBlogPosts = [
  {
    id: 'post-a',
    title: 'Post A',
    date_published: '2024-07-20T10:00:00Z',
    cover_image: { id: 'img-a', type: 'image/avif' }
  },
  {
    id: 'post-b',
    title: 'Post B',
    date_published: '2024-06-15T10:00:00Z',
    cover_image: null
  },
];

describe('BlogListPage Loader', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockBlogPosts }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch blog posts and format data correctly', async () => {
    const result = await blogListPageLoader();

    // In dev mode, the filter uses _in=published,draft
    const expectedUrl = `${baseURL}/items/blog_posts?fields=id,title,date_published,cover_image.id,cover_image.type&filter[status][_in]=published,draft&sort=-date_published`;
    expect(fetch).toHaveBeenCalledWith(expectedUrl);

    expect(result).toHaveLength(2);

    expect(result[0].title).toBe('Post A');
    expect(result[0].link).toBe('/blog/post-a');
    expect(result[0].coverImageId).toBe('img-a');
    expect(result[0].coverImageType).toBe('image/avif');

    expect(result[1].title).toBe('Post B');
    expect(result[1].coverImageId).toBeNull();
  });

  it('should return empty array on fetch failure', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      })
    );

    const result = await blogListPageLoader();
    expect(result).toEqual([]);
  });
});

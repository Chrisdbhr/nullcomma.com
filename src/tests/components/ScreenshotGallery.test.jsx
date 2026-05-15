import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ScreenshotGallery from '../../components/ScreenshotGallery';

describe('ScreenshotGallery', () => {
  const directusScreenshots = [
    { directus_files_id: { id: 'ss-1', type: 'image/avif' } },
    { directus_files_id: { id: 'ss-2', type: 'image/jpeg' } },
  ];

  const steamScreenshots = [
    'https://cdn.akamai.steamstatic.com/steam/apps/12345/ss_abc123.jpg',
    'https://cdn.akamai.steamstatic.com/steam/apps/12345/ss_def456.jpg',
  ];

  it('should render main image with Directus format screenshots', () => {
    render(<ScreenshotGallery screenshots={directusScreenshots} />);

    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('class')).toContain('image-loading');
  });

  it('should render main image with Steam URL format screenshots', () => {
    render(<ScreenshotGallery screenshots={steamScreenshots} />);

    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toContain('cdn.akamai.steamstatic.com');
    expect(img.getAttribute('class')).toContain('image-loading');
  });

  it('should show placeholder when screenshots array is empty', () => {
    const { container } = render(<ScreenshotGallery screenshots={[]} />);

    expect(container.textContent).toContain('No screenshots available.');
  });

  it('should show placeholder when screenshots is undefined', () => {
    const { container } = render(<ScreenshotGallery />);

    expect(container.textContent).toContain('No screenshots available.');
  });

  it('should not render prev/next navigation for single image (Steam format)', () => {
    const { container } = render(
      <ScreenshotGallery screenshots={['https://cdn.akamai.steamstatic.com/steam/apps/12345/ss_single.jpg']} />
    );

    const clickZones = container.querySelectorAll('.lightbox-click-zone');
    expect(clickZones.length).toBe(0);

    const dots = container.querySelectorAll('.gallery-dot');
    expect(dots.length).toBe(0);
  });

  it('should render thumbnails for multiple Directus screenshots', () => {
    const { container } = render(<ScreenshotGallery screenshots={directusScreenshots} />);

    const images = container.querySelectorAll('.gallery-thumbnails img');
    expect(images.length).toBe(2);
  });

  it('should render thumbnails for multiple Steam screenshots', () => {
    const { container } = render(<ScreenshotGallery screenshots={steamScreenshots} />);

    const images = container.querySelectorAll('.gallery-thumbnails img');
    expect(images.length).toBe(2);
  });

  it('should render dot indicators for multiple screenshots', () => {
    render(<ScreenshotGallery screenshots={steamScreenshots} />);

    const dots = document.querySelectorAll('.gallery-dot');
    expect(dots.length).toBe(2);
  });

  it('should render progress bar for multiple screenshots', () => {
    const { container } = render(<ScreenshotGallery screenshots={steamScreenshots} />);

    const progressBar = container.querySelector('.gallery-progress-bar');
    expect(progressBar).not.toBeNull();

    const progressFill = container.querySelector('.gallery-progress-fill');
    expect(progressFill).not.toBeNull();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import ScreenshotGallery from '../../components/ScreenshotGallery';

function openLightbox(container) {
  const mainImage = container.querySelector('.gallery-main-image');
  if (mainImage) mainImage.click();
}

function getCounter(container) {
  const el = container.querySelector('.lightbox-counter');
  return el ? el.textContent : null;
}

function clickLeftZone(container) {
  const zone = container.querySelector('.lightbox-click-prev');
  if (zone) zone.click();
}

function clickRightZone(container) {
  const zone = container.querySelector('.lightbox-click-next');
  if (zone) zone.click();
}

describe('ScreenshotGallery', () => {
  const directusScreenshots = [
    { directus_files_id: { id: 'ss-1', type: 'image/avif' } },
    { directus_files_id: { id: 'ss-2', type: 'image/jpeg' } },
    { directus_files_id: { id: 'ss-3', type: 'image/png' } },
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
    expect(images.length).toBe(3);
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

  describe('lightbox navigation', () => {
    const threeScreenshots = [
      'https://cdn.akamai.steamstatic.com/steam/apps/1/ss_a.jpg',
      'https://cdn.akamai.steamstatic.com/steam/apps/1/ss_b.jpg',
      'https://cdn.akamai.steamstatic.com/steam/apps/1/ss_c.jpg',
    ];

    it('should open lightbox when clicking main gallery image', async () => {
      const { container } = render(<ScreenshotGallery screenshots={threeScreenshots} />);

      expect(container.querySelector('.gallery-lightbox')).toBeNull();

      openLightbox(container);

      await waitFor(() => {
        expect(container.querySelector('.gallery-lightbox')).not.toBeNull();
      });
    });

    it('should start at image 1 of 3 when opening lightbox', async () => {
      const { container } = render(<ScreenshotGallery screenshots={threeScreenshots} />);

      openLightbox(container);

      await waitFor(() => {
        expect(getCounter(container)).toContain('1 / 3');
      });
    });

    it('LEFT click zone should navigate to PREVIOUS image', async () => {
      const { container } = render(<ScreenshotGallery screenshots={threeScreenshots} />);

      openLightbox(container);
      await waitFor(() => expect(getCounter(container)).toContain('1 / 3'));

      // Left from 1 → 3 (wrapping backward)
      clickLeftZone(container);
      await waitFor(() => expect(getCounter(container)).toContain('3 / 3'));

      // Left from 3 → 2
      clickLeftZone(container);
      await waitFor(() => expect(getCounter(container)).toContain('2 / 3'));
    });

    it('RIGHT click zone should navigate to NEXT image', async () => {
      const { container } = render(<ScreenshotGallery screenshots={threeScreenshots} />);

      openLightbox(container);
      await waitFor(() => expect(getCounter(container)).toContain('1 / 3'));

      // Right from 1 → 2
      clickRightZone(container);
      await waitFor(() => expect(getCounter(container)).toContain('2 / 3'));

      // Right from 2 → 3
      clickRightZone(container);
      await waitFor(() => expect(getCounter(container)).toContain('3 / 3'));
    });

    it('should navigate forward via right, back via left', async () => {
      const { container } = render(<ScreenshotGallery screenshots={threeScreenshots} />);

      openLightbox(container);
      await waitFor(() => expect(getCounter(container)).toContain('1 / 3'));

      clickRightZone(container);
      await waitFor(() => expect(getCounter(container)).toContain('2 / 3'));

      clickRightZone(container);
      await waitFor(() => expect(getCounter(container)).toContain('3 / 3'));

      clickLeftZone(container);
      await waitFor(() => expect(getCounter(container)).toContain('2 / 3'));

      clickLeftZone(container);
      await waitFor(() => expect(getCounter(container)).toContain('1 / 3'));
    });

    it('clicking a thumbnail should select that image and not trigger navigation', async () => {
      const { container } = render(<ScreenshotGallery screenshots={threeScreenshots} />);

      openLightbox(container);
      await waitFor(() => expect(getCounter(container)).toContain('1 / 3'));

      const thumbnails = container.querySelectorAll('.lightbox-thumb');
      expect(thumbnails.length).toBe(3);

      // Click the third thumbnail → image 3
      thumbnails[2].click();
      await waitFor(() => expect(getCounter(container)).toContain('3 / 3'));

      // Click the first thumbnail → image 1
      thumbnails[0].click();
      await waitFor(() => expect(getCounter(container)).toContain('1 / 3'));
    });
  });
});

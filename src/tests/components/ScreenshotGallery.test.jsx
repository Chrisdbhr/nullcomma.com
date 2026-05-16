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

  describe('trailer video slide', () => {
    const trailerUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    const screenshotsWithTrailer = [
      { type: 'video', url: trailerUrl, title: 'Trailer' },
      { directus_files_id: { id: 'ss-1', type: 'image/jpeg' } },
      { directus_files_id: { id: 'ss-2', type: 'image/jpeg' } },
    ];

    it('should render trailer as first slide in gallery', () => {
      const { container } = render(<ScreenshotGallery screenshots={screenshotsWithTrailer} />);

      const iframe = container.querySelector('iframe');
      expect(iframe).not.toBeNull();
      expect(iframe.getAttribute('src')).toContain('youtube.com');
    });

    it('should show play icon overlay on trailer thumbnail', () => {
      const { container } = render(<ScreenshotGallery screenshots={screenshotsWithTrailer} />);

      // Video thumbnail has .lightbox-thumb class, images are <img> elements
      const videoThumb = container.querySelector('.gallery-thumbnails .lightbox-thumb');
      expect(videoThumb).not.toBeNull();
      expect(videoThumb.querySelector('.trailer-play-icon')).not.toBeNull();

      // Total thumbnails = 3 (1 video + 2 images)
      const allThumbs = container.querySelectorAll('.gallery-thumbnails .lightbox-thumb, .gallery-thumbnails img');
      expect(allThumbs.length).toBe(3);
    });

    it('should render iframe in lightbox when viewing trailer slide', async () => {
      const { container } = render(<ScreenshotGallery screenshots={screenshotsWithTrailer} />);

      openLightbox(container);
      await waitFor(() => expect(getCounter(container)).toContain('1 / 3'));

      const iframe = container.querySelector('.lightbox-image-container iframe');
      expect(iframe).not.toBeNull();
      expect(iframe.getAttribute('src')).toContain(trailerUrl);
      expect(iframe.getAttribute('src')).toContain('mute=0');
      expect(iframe.getAttribute('src')).toContain('controls=0');
    });

    it('should destroy iframe when navigating away from trailer slide', async () => {
      const { container } = render(<ScreenshotGallery screenshots={screenshotsWithTrailer} />);

      openLightbox(container);
      await waitFor(() => expect(getCounter(container)).toContain('1 / 3'));
      expect(container.querySelector('.lightbox-image-container iframe')).not.toBeNull();

      clickRightZone(container);
      await waitFor(() => expect(getCounter(container)).toContain('2 / 3'));

      expect(container.querySelector('.lightbox-image-container iframe')).toBeNull();
      expect(container.querySelector('.lightbox-image-container img')).not.toBeNull();
    });

    it('should restart video when navigating back to trailer slide', async () => {
      const { container } = render(<ScreenshotGallery screenshots={screenshotsWithTrailer} />);

      openLightbox(container);
      await waitFor(() => expect(getCounter(container)).toContain('1 / 3'));
      const firstIframe = container.querySelector('.lightbox-image-container iframe');
      expect(firstIframe).not.toBeNull();

      clickRightZone(container);
      await waitFor(() => expect(getCounter(container)).toContain('2 / 3'));

      clickLeftZone(container);
      await waitFor(() => expect(getCounter(container)).toContain('1 / 3'));

      const newIframe = container.querySelector('.lightbox-image-container iframe');
      expect(newIframe).not.toBeNull();
      expect(newIframe).not.toBe(firstIframe);
    });

    it('should navigate from last image back to trailer via right', async () => {
      const { container } = render(<ScreenshotGallery screenshots={screenshotsWithTrailer} />);

      openLightbox(container);
      await waitFor(() => expect(getCounter(container)).toContain('1 / 3'));

      // Go to last slide
      clickRightZone(container);
      await waitFor(() => expect(getCounter(container)).toContain('2 / 3'));
      clickRightZone(container);
      await waitFor(() => expect(getCounter(container)).toContain('3 / 3'));

      // Right again → back to trailer (slide 1)
      clickRightZone(container);
      await waitFor(() => expect(getCounter(container)).toContain('1 / 3'));

      // Should have iframe again
      expect(container.querySelector('.lightbox-image-container iframe')).not.toBeNull();
    });

    it('should auto-advance to next slide when YouTube video ends', async () => {
      const { container } = render(<ScreenshotGallery screenshots={screenshotsWithTrailer} />);

      openLightbox(container);
      await waitFor(() => expect(getCounter(container)).toContain('1 / 3'));

      // Simulate YouTube video end message
      window.dispatchEvent(new MessageEvent('message', {
        data: JSON.stringify({ event: 'onStateChange', info: 0 }),
      }));

      await waitFor(() => expect(getCounter(container)).toContain('2 / 3'));
    });
  });
});

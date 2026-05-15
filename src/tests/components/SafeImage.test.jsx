import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SafeImage from '../../components/SafeImage';

describe('SafeImage Component', () => {
  it('should return null when id is not provided', () => {
    const { container } = render(<SafeImage alt="test" />);
    expect(container.firstChild).toBeNull();
  });

  it('should render a picture element with AVIF source and JPG fallback', () => {
    render(
      <SafeImage
        id="test-avif-id"
        width={800}
        mimeType="image/avif"
        alt="Test image"
        className="test-class"
      />
    );

    const picture = document.querySelector('picture');
    expect(picture).not.toBeNull();

    const sources = document.querySelectorAll('source');
    expect(sources).toHaveLength(2);
    expect(sources[0].getAttribute('srcSet')).toContain('test-avif-id');
    expect(sources[0].getAttribute('type')).toBe('image/avif');
    expect(sources[1].getAttribute('srcSet')).toContain('format=jpg');
    expect(sources[1].getAttribute('type')).toBe('image/jpeg');

    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('alt')).toBe('Test image');
    expect(img.getAttribute('class')).toBe('test-class');
    expect(img.getAttribute('src')).toContain('format=jpg');
  });

  it('should render a picture element with WebP source for GIF images', () => {
    render(
      <SafeImage
        id="test-gif-id"
        width={400}
        mimeType="image/gif"
        alt="Animated GIF"
      />
    );

    const picture = document.querySelector('picture');
    expect(picture).not.toBeNull();

    const sources = document.querySelectorAll('source');
    expect(sources).toHaveLength(2);
    expect(sources[0].getAttribute('srcSet')).toContain('format=webp');
    expect(sources[0].getAttribute('type')).toBe('image/webp');
    expect(sources[1].getAttribute('srcSet')).toContain('format=jpg');
  });

  it('should render a direct img for PNG images (no picture wrapper)', () => {
    render(
      <SafeImage
        id="test-png-id"
        width={600}
        mimeType="image/png"
        alt="PNG image"
      />
    );

    const picture = document.querySelector('picture');
    expect(picture).toBeNull();

    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toContain('test-png-id');
    expect(img.getAttribute('src')).not.toContain('format=');
  });

  it('should render a direct img for JPG images (no picture wrapper)', () => {
    render(
      <SafeImage
        id="test-jpg-id"
        width={800}
        mimeType="image/jpeg"
        alt="JPG image"
      />
    );

    const picture = document.querySelector('picture');
    expect(picture).toBeNull();

    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toContain('test-jpg-id');
    expect(img.getAttribute('src')).not.toContain('format=');
  });

  it('should render a direct img for unknown/empty mimeType', () => {
    render(
      <SafeImage
        id="test-unknown-id"
        width={800}
        mimeType=""
        alt="Unknown format"
      />
    );

    const picture = document.querySelector('picture');
    expect(picture).toBeNull();

    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toContain('test-unknown-id');
  });

  it('should render a direct img for GIF (no picture wrapper, direct WebP URL)', () => {
    render(
      <SafeImage
        id="test-gif-direct"
        width={800}
        mimeType="image/gif"
        alt="GIF"
      />
    );

    // GIF gets a picture element with WebP source
    const picture = document.querySelector('picture');
    expect(picture).not.toBeNull();

    const sources = document.querySelectorAll('source');
    expect(sources[0].getAttribute('srcSet')).toContain('format=webp');
    expect(sources[0].getAttribute('type')).toBe('image/webp');
  });

  it('should show placeholder when image fails to load (403/404 scenario)', () => {
    const { container, rerender } = render(
      <SafeImage
        id="broken-asset-id"
        width={800}
        mimeType="image/avif"
        alt="Broken image"
      />
    );

    // Simulate onError event (both primary and fallback failed)
    const img = container.querySelector('img');
    img.dispatchEvent(new Event('error'));

    // Rerender to trigger state update
    rerender(
      <SafeImage
        id="broken-asset-id"
        width={800}
        mimeType="image/avif"
        alt="Broken image"
      />
    );

    // Should show placeholder
    expect(container.textContent).toContain('Image unavailable');
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('picture')).toBeNull();
  });

  it('should show placeholder when direct img (PNG/JPG) fails to load', () => {
    const { container, rerender } = render(
      <SafeImage
        id="broken-png-id"
        width={800}
        mimeType="image/png"
        alt="Broken PNG"
      />
    );

    // Simulate onError event
    const img = container.querySelector('img');
    img.dispatchEvent(new Event('error'));

    // Rerender to trigger state update
    rerender(
      <SafeImage
        id="broken-png-id"
        width={800}
        mimeType="image/png"
        alt="Broken PNG"
      />
    );

    // Should show placeholder
    expect(container.textContent).toContain('Image unavailable');
  });
});

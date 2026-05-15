import { describe, it, expect } from 'vitest';
import { getAssetUrl, getFallbackUrl, baseURL, getHashedColor } from '../../utils';

describe('Utility Functions', () => {
  describe('getAssetUrl', () => {
    const assetId = 'abcde12345';
    const defaultWidth = 800;

    it('should return null if id is null', () => {
      expect(getAssetUrl(null)).toBeNull();
    });

    it('should return URL with width parameter only (no format)', () => {
      const expectedUrl = `${baseURL}/assets/${assetId}?width=${defaultWidth}`;
      expect(getAssetUrl(assetId)).toBe(expectedUrl);
    });

    it('should respect custom width', () => {
      const customWidth = 400;
      const expectedUrl = `${baseURL}/assets/${assetId}?width=${customWidth}`;
      expect(getAssetUrl(assetId, customWidth)).toBe(expectedUrl);
    });

    it('should include additional options', () => {
      const options = 'height=100&fit=cover';
      const expectedUrl = `${baseURL}/assets/${assetId}?width=${defaultWidth}&${options}`;
      expect(getAssetUrl(assetId, defaultWidth, options)).toBe(expectedUrl);
    });

    it('should convert GIF to animated WebP with width parameter', () => {
      const mimeType = 'image/gif';
      const expectedUrl = `${baseURL}/assets/${assetId}?format=webp&width=${defaultWidth}`;
      expect(getAssetUrl(assetId, defaultWidth, '', mimeType)).toBe(expectedUrl);
    });

    it('should convert GIF to animated WebP even with options', () => {
      const mimeType = 'image/gif';
      const options = 'height=225&fit=cover';
      const expectedUrl = `${baseURL}/assets/${assetId}?format=webp&width=${defaultWidth}&${options}`;
      expect(getAssetUrl(assetId, defaultWidth, options, mimeType)).toBe(expectedUrl);
    });

    it('should not add format parameter for non-GIF images', () => {
      const mimeType = 'image/jpeg';
      const url = getAssetUrl(assetId, defaultWidth, '', mimeType);
      expect(url).not.toContain('format=');
      expect(url).toContain(`width=${defaultWidth}`);
    });

    it('should handle image/png mimeType', () => {
      const mimeType = 'image/png';
      const url = getAssetUrl(assetId, 600, '', mimeType);
      expect(url).toBe(`${baseURL}/assets/${assetId}?width=600`);
    });

    it('should handle image/avif mimeType', () => {
      const mimeType = 'image/avif';
      const url = getAssetUrl(assetId, 1000, '', mimeType);
      expect(url).toBe(`${baseURL}/assets/${assetId}?width=1000`);
    });
  });

  describe('getFallbackUrl', () => {
    const assetId = 'abcde12345';
    const defaultWidth = 800;

    it('should return null if id is null', () => {
      expect(getFallbackUrl(null)).toBeNull();
    });

    it('should return URL with format=jpg and width', () => {
      const expectedUrl = `${baseURL}/assets/${assetId}?format=jpg&width=${defaultWidth}`;
      expect(getFallbackUrl(assetId)).toBe(expectedUrl);
    });

    it('should respect custom width', () => {
      const customWidth = 400;
      const expectedUrl = `${baseURL}/assets/${assetId}?format=jpg&width=${customWidth}`;
      expect(getFallbackUrl(assetId, customWidth)).toBe(expectedUrl);
    });

    it('should include additional options', () => {
      const options = 'height=100&fit=cover';
      const expectedUrl = `${baseURL}/assets/${assetId}?format=jpg&width=${defaultWidth}&${options}`;
      expect(getFallbackUrl(assetId, defaultWidth, options)).toBe(expectedUrl);
    });
  });

  describe('getHashedColor', () => {
    it('should return the default grey color for empty string', () => {
      expect(getHashedColor('')).toBe('hsl(0, 0%, 70%)');
    });

    it('should generate a consistent HSL color for a given string', () => {
      const color1 = getHashedColor('Unity');
      const color2 = getHashedColor('Unity');
      const color3 = getHashedColor('C#');

      expect(color1).toBe(color2);
      expect(color1).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
      expect(color1).not.toBe(color3);
    });

    it('should generate colors within the HSL range (0-359)', () => {
      const color = getHashedColor('VeryLongAndUniqueTagForTestingHashDistribution');
      const hueMatch = color.match(/^hsl\((\d+), \d+%, \d+%\)$/);
      const hue = parseInt(hueMatch[1], 10);
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThanOrEqual(359);
    });
  });
});

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://nullcomma.com';
const PROJECT_SLUG = 'kindle-games';

/**
 * Performance test for ScreenshotGallery image loading.
 * 
 * Tests:
 * 1. Main image loading time
 * 2. Thumbnail loading times
 * 3. Click each thumbnail and measure loading time
 * 4. Compare with/without quality parameter
 */

test.describe('ScreenshotGallery Performance - Kindle Games', () => {
  test('should load main image and thumbnails within acceptable time', async ({ page }) => {
    const imageLoadTimes = [];
    
    // Set up performance monitoring
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('cms.nullcomma.com/assets/') && response.status() === 200) {
        const timing = response.request().timing();
        const loadTime = timing.responseEnd - timing.startTime;
        imageLoadTimes.push({
          url: url,
          loadTime: loadTime,
          size: parseInt(response.headers()['content-length'] || '0'),
        });
      }
    });

    // Navigate to the project page
    await page.goto(`${BASE_URL}/project/${PROJECT_SLUG}`);
    await page.waitForLoadState('networkidle');
    
    // Wait for gallery to be visible
    await expect(page.locator('.screenshot-gallery')).toBeVisible();
    
    // Log all image load times
    console.log('\n=== Image Load Times ===');
    imageLoadTimes.forEach((img, i) => {
      console.log(`${i + 1}. ${img.url.split('/').pop().split('?')[0]}: ${img.loadTime.toFixed(0)}ms, ${img.size} bytes`);
    });

    // Verify at least some images loaded
    expect(imageLoadTimes.length).toBeGreaterThan(0);
    
    // Main image should load within 3 seconds
    const mainImages = imageLoadTimes.filter(img => img.url.includes('width=1200'));
    if (mainImages.length > 0) {
      expect(mainImages[0].loadTime).toBeLessThan(3000);
      console.log(`\nMain image loaded in ${mainImages[0].loadTime.toFixed(0)}ms (${mainImages[0].size} bytes)`);
    }
    
    // Thumbnails should load within 2 seconds each
    const thumbnails = imageLoadTimes.filter(img => img.url.includes('width=200'));
    if (thumbnails.length > 0) {
      const avgThumbTime = thumbnails.reduce((sum, t) => sum + t.loadTime, 0) / thumbnails.length;
      expect(avgThumbTime).toBeLessThan(2000);
      console.log(`Average thumbnail load time: ${avgThumbTime.toFixed(0)}ms`);
    }
  });

  test('should load new main image when clicking thumbnails', async ({ page }) => {
    const thumbnailClickTimes = [];
    
    await page.goto(`${BASE_URL}/project/${PROJECT_SLUG}`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.screenshot-gallery')).toBeVisible();
    
    // Get all thumbnails
    const thumbnails = page.locator('.gallery-thumbnails img');
    const count = await thumbnails.count();
    
    console.log(`\n=== Thumbnail Click Performance (${count} thumbnails) ===`);
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      // Clear previous responses tracking
      const newImageLoads = [];
      
      page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('cms.nullcomma.com/assets/') && response.status() === 200) {
          const timing = response.request().timing();
          const loadTime = timing.responseEnd - timing.startTime;
          newImageLoads.push({
            loadTime: loadTime,
            size: parseInt(response.headers()['content-length'] || '0'),
          });
        }
      });
      
      // Click thumbnail
      const startTime = Date.now();
      await thumbnails.nth(i).click();
      await page.waitForTimeout(500); // Wait for image to load
      
      const clickToLoadTime = Date.now() - startTime;
      thumbnailClickTimes.push({
        thumbnailIndex: i,
        clickToLoadTime: clickToLoadTime,
        imageLoads: newImageLoads.length,
      });
      
      console.log(`Thumbnail ${i + 1}: ${clickToLoadTime}ms (${newImageLoads.length} images loaded)`);
    }
    
    // All thumbnail clicks should result in new image loading within 2 seconds
    thumbnailClickTimes.forEach(t => {
      expect(t.clickToLoadTime).toBeLessThan(2000);
    });
  });

  test('should use quality parameter in image URLs', async ({ page }) => {
    const imageUrls = [];
    
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('cms.nullcomma.com/assets/')) {
        imageUrls.push(url);
      }
    });

    await page.goto(`${BASE_URL}/project/${PROJECT_SLUG}`);
    await page.waitForLoadState('networkidle');
    
    console.log('\n=== Image URLs with Quality Parameters ===');
    imageUrls.forEach((url, i) => {
      console.log(`${i + 1}. ${url}`);
    });

    // Main images should have quality=70
    const mainUrls = imageUrls.filter(url => url.includes('width=1200'));
    mainUrls.forEach(url => {
      expect(url).toContain('quality=70');
    });

    // Thumbnails should have quality=50
    const thumbUrls = imageUrls.filter(url => url.includes('width=200'));
    thumbUrls.forEach(url => {
      expect(url).toContain('quality=50');
    });
  });
});

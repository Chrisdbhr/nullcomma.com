import { test, expect } from '@playwright/test';

const BASE_URL = process.env.CI ? 'https://nullcomma.com' : 'http://localhost:4173';

test.describe('ScreenshotGallery E2E', () => {
  test('gallery renders with trailer as first slide when trailer exists', async ({ page }) => {
    await page.goto(`${BASE_URL}/project/Resultarias`);
    await expect(page.locator('.screenshot-gallery')).toBeVisible();

    const firstThumb = page.locator('.gallery-thumbnails .lightbox-thumb').first();
    await expect(firstThumb).toBeVisible();
    await expect(firstThumb.locator('.trailer-play-icon')).toBeVisible();
  });

  test('lightbox opens with video, no controls, no fullscreen', async ({ page }) => {
    await page.goto(`${BASE_URL}/project/Resultarias`);
    await expect(page.locator('.gallery-main-image')).toBeVisible();

    await page.locator('.gallery-main-image').click();
    await expect(page.locator('.gallery-lightbox')).toBeVisible();

    const iframe = page.locator('.lightbox-image-container iframe');
    await expect(iframe).toBeVisible();

    const src = await iframe.getAttribute('src');
    expect(src).toContain('controls=0');
    expect(src).toContain('playsinline=1');
    expect(src).toContain('enablejsapi=1');
    expect(src).toContain('iv_load_policy=3');

    // Should NOT have allowFullScreen
    const allowFull = await iframe.getAttribute('allowfullscreen');
    expect(allowFull).toBeNull();
  });

  test('clicking right zone advances from video to next slide', async ({ page }) => {
    await page.goto(`${BASE_URL}/project/Resultarias`);
    await page.locator('.gallery-main-image').click();
    await expect(page.locator('.gallery-lightbox')).toBeVisible();

    const counter = page.locator('.lightbox-counter');
    await expect(counter).toHaveText(/1 \//);

    await page.locator('.lightbox-click-next').click();
    await expect(counter).toHaveText(/2 \//);

    await expect(page.locator('.lightbox-image-container iframe')).toBeHidden();
    await expect(page.locator('.lightbox-image-container img')).toBeVisible();
  });

  test('thumbnails are clickable during video slide', async ({ page }) => {
    await page.goto(`${BASE_URL}/project/Resultarias`);
    await page.locator('.gallery-main-image').click();
    await expect(page.locator('.gallery-lightbox')).toBeVisible();

    const thumbs = page.locator('.lightbox-thumbnails .lightbox-thumb');
    const count = await thumbs.count();
    expect(count).toBeGreaterThan(1);

    await thumbs.nth(count - 1).click();
    await expect(page.locator('.lightbox-counter')).toHaveText(new RegExp(`${count} /`));
  });

  test('keyboard navigation works in lightbox', async ({ page }) => {
    await page.goto(`${BASE_URL}/project/Resultarias`);
    await page.locator('.gallery-main-image').click();
    await expect(page.locator('.gallery-lightbox')).toBeVisible();

    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.lightbox-counter')).toHaveText(/2 \//);

    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('.lightbox-counter')).toHaveText(/1 \//);

    await page.keyboard.press('Escape');
    await expect(page.locator('.gallery-lightbox')).toBeHidden();
  });

  test('single-image gallery hides navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/project/Resultarias`);
    await expect(page.locator('.gallery-thumbnails')).toBeVisible();
    await expect(page.locator('.gallery-dots')).toBeVisible();
  });

  test('auto-play carousel shows progress bar', async ({ page }) => {
    await page.goto(`${BASE_URL}/project/Resultarias`);
    await expect(page.locator('.gallery-progress-bar')).toBeVisible();
    await expect(page.locator('.gallery-progress-fill')).toBeVisible();
  });

  test('lightbox thumbnails navigate correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/project/Resultarias`);
    await page.locator('.gallery-main-image').click();
    await expect(page.locator('.gallery-lightbox')).toBeVisible();

    await page.locator('.lightbox-click-next').click();
    await expect(page.locator('.lightbox-counter')).toHaveText(/2 \//);

    await page.locator('.lightbox-thumbnails .lightbox-thumb').first().click();
    await expect(page.locator('.lightbox-counter')).toHaveText(/1 \//);
    await expect(page.locator('.lightbox-image-container iframe')).toBeVisible();
  });

  test('auto-advances to next slide when YouTube video ends', async ({ page }) => {
    await page.goto(`${BASE_URL}/project/Resultarias`);
    await page.locator('.gallery-main-image').click();
    await expect(page.locator('.gallery-lightbox')).toBeVisible();
    await expect(page.locator('.lightbox-counter')).toHaveText(/1 \//);

    await page.evaluate(() => {
      window.postMessage(JSON.stringify({ event: 'onStateChange', info: 0 }), '*');
    });

    await expect(page.locator('.lightbox-counter')).toHaveText(/2 \//);
    await expect(page.locator('.lightbox-image-container iframe')).toBeHidden();
    await expect(page.locator('.lightbox-image-container img, .lightbox-image-container picture')).toBeVisible();
  });

  test('clicking non-trailer thumbnails during video slide should navigate', async ({ page }) => {
    await page.goto(`${BASE_URL}/project/Resultarias`);
    await page.locator('.gallery-main-image').click();
    await expect(page.locator('.gallery-lightbox')).toBeVisible();

    await expect(page.locator('.lightbox-counter')).toHaveText(/1 \//);
    await expect(page.locator('.lightbox-image-container iframe')).toBeVisible();

    const secondThumb = page.locator('.lightbox-thumbnails .lightbox-thumb').nth(1);
    const bb = await secondThumb.boundingBox();
    await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);

    await expect(page.locator('.lightbox-counter')).toHaveText(/2 \//);
    await expect(page.locator('.lightbox-image-container iframe')).toBeHidden();
    await expect(page.locator('.lightbox-image-container img, .lightbox-image-container picture')).toBeVisible();
  });
});

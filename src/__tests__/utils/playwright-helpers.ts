/**
 * Playwright E2E test helpers
 * Utilities for end-to-end testing with Playwright
 */
import { Page, Locator } from '@playwright/test';

/**
 * Upload a file using file input
 */
export async function uploadFile(
  page: Page,
  fileInputSelector: string,
  filePath: string
) {
  const fileInput = page.locator(fileInputSelector);
  await fileInput.setInputFiles(filePath);
}

/**
 * Wait for network idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Take a screenshot with a specific name
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  options?: { fullPage?: boolean }
) {
  await page.screenshot({
    path: `screenshots/${name}.png`,
    fullPage: options?.fullPage ?? false,
  });
}

/**
 * Wait for element to be visible and stable
 */
export async function waitForStableElement(locator: Locator, timeout = 5000) {
  await locator.waitFor({ state: 'visible', timeout });
  // Wait for animations to complete
  await locator.evaluate((el) => {
    return Promise.all(
      el.getAnimations().map((animation) => animation.finished)
    );
  });
}

/**
 * Simulate keyboard shortcut
 */
export async function pressKeyboardShortcut(
  page: Page,
  modifiers: string[],
  key: string
) {
  const isMac = process.platform === 'darwin';
  const modifier = modifiers.map(m => 
    m === 'Control' && isMac ? 'Meta' : m
  ).join('+');
  
  await page.keyboard.press(`${modifier}+${key}`);
}

/**
 * Drag and drop element
 */
export async function dragAndDrop(
  page: Page,
  sourceSelector: string,
  targetSelector: string
) {
  const source = page.locator(sourceSelector);
  const target = page.locator(targetSelector);
  
  await source.dragTo(target);
}

/**
 * Wait for download to complete
 */
export async function waitForDownload(page: Page, triggerAction: () => Promise<void>) {
  const downloadPromise = page.waitForEvent('download');
  await triggerAction();
  const download = await downloadPromise;
  return download;
}

/**
 * Check if element is visible in viewport
 */
export async function isInViewport(locator: Locator): Promise<boolean> {
  return await locator.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  });
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(locator: Locator) {
  await locator.evaluate((el) => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/**
 * Get computed style of element
 */
export async function getComputedStyle(
  locator: Locator,
  property: string
): Promise<string> {
  return await locator.evaluate((el, prop) => {
    return window.getComputedStyle(el).getPropertyValue(prop);
  }, property);
}

/**
 * Wait for text to appear
 */
export async function waitForText(
  page: Page,
  text: string,
  timeout = 5000
) {
  await page.waitForSelector(`text=${text}`, { timeout });
}

/**
 * Clear browser storage
 */
export async function clearBrowserStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Mock network request
 */
export async function mockNetworkRequest(
  page: Page,
  url: string,
  response: any
) {
  await page.route(url, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

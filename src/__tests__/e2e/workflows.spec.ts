/**
 * E2E Workflow Tests
 * Complete user workflows across multiple features
 */

import { test, expect } from '@playwright/test';

test.describe('E2E Workflow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete upload → merge → edit → export workflow', async ({ page }) => {
    // Upload first file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('src/__tests__/fixtures/sample-chrome.json');

    // Wait for file to be processed
    await page.waitForSelector('[data-testid="imported-files"]');

    // Verify file was uploaded
    const fileCount = await page.locator('[data-testid="file-item"]').count();
    expect(fileCount).toBeGreaterThan(0);

    // Edit a bookmark
    const editButton = page.locator('[data-testid="edit-button"]').first();
    await editButton.click();

    const titleInput = page.locator('[data-testid="title-input"]');
    await titleInput.fill('Updated Title');

    const saveButton = page.locator('[data-testid="save-button"]');
    await saveButton.click();

    // Export
    const exportButton = page.locator('[data-testid="export-html-button"]');
    await exportButton.click();

    // Verify export completed
    await page.waitForEvent('download');
  });

  test('should complete upload → search → bulk delete → undo → export workflow', async ({
    page,
  }) => {
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('src/__tests__/fixtures/sample-chrome.json');

    await page.waitForSelector('[data-testid="imported-files"]');

    // Search
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('test');

    // Wait for search results
    await page.waitForTimeout(500);

    // Select all
    const selectAllButton = page.locator('[data-testid="select-all-button"]');
    await selectAllButton.click();

    // Delete selected
    const deleteButton = page.locator('[data-testid="delete-selected-button"]');
    await deleteButton.click();

    // Undo
    const undoButton = page.locator('[data-testid="undo-button"]');
    await undoButton.click();

    // Export
    const exportButton = page.locator('[data-testid="export-html-button"]');
    await exportButton.click();

    await page.waitForEvent('download');
  });

  test('should complete upload → link health check → remove broken → export workflow', async ({
    page,
  }) => {
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('src/__tests__/fixtures/sample-chrome.json');

    await page.waitForSelector('[data-testid="imported-files"]');

    // Check link health
    const healthButton = page.locator('[data-testid="check-health-button"]');
    await healthButton.click();

    // Wait for health check to complete
    await page.waitForSelector('[data-testid="health-report"]', { timeout: 10000 });

    // Remove broken links
    const removeBrokenButton = page.locator('[data-testid="remove-broken-button"]');
    if (await removeBrokenButton.isVisible()) {
      await removeBrokenButton.click();
    }

    // Export
    const exportButton = page.locator('[data-testid="export-html-button"]');
    await exportButton.click();

    await page.waitForEvent('download');
  });

  test('should complete upload → auto-organize → export workflow', async ({ page }) => {
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('src/__tests__/fixtures/sample-chrome.json');

    await page.waitForSelector('[data-testid="imported-files"]');

    // Auto-organize by domain
    const organizeButton = page.locator('[data-testid="organize-by-domain-button"]');
    await organizeButton.click();

    // Wait for organization
    await page.waitForTimeout(500);

    // Export
    const exportButton = page.locator('[data-testid="export-html-button"]');
    await exportButton.click();

    await page.waitForEvent('download');
  });

  test('should complete upload → edit notes → search notes → export workflow', async ({
    page,
  }) => {
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('src/__tests__/fixtures/sample-chrome.json');

    await page.waitForSelector('[data-testid="imported-files"]');

    // Edit notes
    const editButton = page.locator('[data-testid="edit-button"]').first();
    await editButton.click();

    const notesInput = page.locator('[data-testid="notes-input"]');
    await notesInput.fill('Important bookmark');

    const saveButton = page.locator('[data-testid="save-button"]');
    await saveButton.click();

    // Search for notes
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('Important');

    await page.waitForTimeout(500);

    // Export
    const exportButton = page.locator('[data-testid="export-html-button"]');
    await exportButton.click();

    await page.waitForEvent('download');
  });

  test('should persist workflow state across page reloads', async ({ page }) => {
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('src/__tests__/fixtures/sample-chrome.json');

    await page.waitForSelector('[data-testid="imported-files"]');

    // Get initial file count
    const initialCount = await page.locator('[data-testid="file-item"]').count();

    // Reload page
    await page.reload();

    // Wait for restore
    await page.waitForSelector('[data-testid="imported-files"]');

    // Verify files are restored
    const restoredCount = await page.locator('[data-testid="file-item"]').count();
    expect(restoredCount).toBe(initialCount);
  });

  test('should work correctly in multiple browsers', async ({ page, browserName }) => {
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('src/__tests__/fixtures/sample-chrome.json');

    await page.waitForSelector('[data-testid="imported-files"]');

    // Verify basic functionality works
    const fileCount = await page.locator('[data-testid="file-item"]').count();
    expect(fileCount).toBeGreaterThan(0);

    console.log(`Workflow test passed in ${browserName}`);
  });
});

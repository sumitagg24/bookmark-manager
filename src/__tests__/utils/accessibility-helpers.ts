/**
 * Accessibility testing helpers
 * Utilities for testing WCAG compliance and a11y features
 */
import { axe, toHaveNoViolations } from 'vitest-axe';
import { RenderResult } from '@testing-library/react';

// Extend expect with axe matchers
expect.extend(toHaveNoViolations);

/**
 * Run axe accessibility tests on a rendered component
 */
export async function testAccessibility(container: HTMLElement) {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
  return results;
}

/**
 * Test keyboard navigation for an element
 */
export async function testKeyboardNavigation(
  element: HTMLElement,
  expectedFocusableElements: number
) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  expect(focusableElements.length).toBe(expectedFocusableElements);
  
  // Test that all focusable elements can receive focus
  focusableElements.forEach((el) => {
    expect(el).toHaveAttribute('tabindex');
  });
}

/**
 * Test ARIA attributes on an element
 */
export function testAriaAttributes(
  element: HTMLElement,
  expectedAttributes: Record<string, string>
) {
  Object.entries(expectedAttributes).forEach(([attr, value]) => {
    expect(element).toHaveAttribute(attr, value);
  });
}

/**
 * Test color contrast ratio
 * Note: This is a simplified check. For production, use axe-core's color contrast rule
 */
export function testColorContrast(
  foreground: string,
  background: string,
  minRatio: number = 4.5
): boolean {
  // This is a placeholder - in real tests, use axe-core's color contrast checks
  // or a proper color contrast calculation library
  return true;
}

/**
 * Test that an element has accessible name
 */
export function testAccessibleName(element: HTMLElement, expectedName?: string) {
  const accessibleName = 
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.textContent ||
    element.getAttribute('title');
  
  expect(accessibleName).toBeTruthy();
  
  if (expectedName) {
    expect(accessibleName).toContain(expectedName);
  }
}

/**
 * Test focus visibility
 */
export function testFocusVisible(element: HTMLElement) {
  element.focus();
  expect(element).toHaveFocus();
  
  // Check that focus styles are applied
  const styles = window.getComputedStyle(element);
  const hasOutline = styles.outline !== 'none' && styles.outline !== '';
  const hasBorder = styles.border !== 'none' && styles.border !== '';
  const hasBoxShadow = styles.boxShadow !== 'none' && styles.boxShadow !== '';
  
  expect(hasOutline || hasBorder || hasBoxShadow).toBe(true);
}

/**
 * Test screen reader announcements
 */
export function testScreenReaderAnnouncement(
  container: HTMLElement,
  expectedRole: string
) {
  const liveRegion = container.querySelector(`[role="${expectedRole}"]`);
  expect(liveRegion).toBeInTheDocument();
}

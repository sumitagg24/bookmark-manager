/**
 * Test utilities for React component testing
 * Provides custom render function with providers and common utilities
 */
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { ...options }),
  };
}

/**
 * Wait for a condition to be true with timeout
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

/**
 * Create a mock File object for testing file uploads
 */
export function createMockFile(
  content: string,
  filename: string,
  type: string
): File {
  const blob = new Blob([content], { type });
  return new File([blob], filename, { type });
}

/**
 * Simulate file drop event
 */
export function createFileDropEvent(files: File[]): Event {
  const event = new Event('drop', { bubbles: true });
  Object.defineProperty(event, 'dataTransfer', {
    value: {
      files,
      items: files.map(file => ({
        kind: 'file',
        type: file.type,
        getAsFile: () => file,
      })),
      types: ['Files'],
    },
  });
  return event;
}

/**
 * Mock localStorage for tests
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
}

/**
 * Wait for async state updates
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Re-export everything from testing library
export * from '@testing-library/react';
export { userEvent };

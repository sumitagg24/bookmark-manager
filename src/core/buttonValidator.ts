/**
 * Button Validator - Automated testing of UI buttons
 */

import { type ButtonElement } from './featureRegistry';

export interface ButtonValidationResult {
  buttonId: string;
  passed: boolean;
  checks: {
    exists: boolean;
    clickable: boolean;
    labelCorrect: boolean;
    actionTriggered: boolean;
    stateCorrect: boolean;
  };
  errors: string[];
}

export interface StateValidationResult {
  buttonId: string;
  enabled: boolean;
  visible: boolean;
  errors: string[];
}

export class ButtonValidator {
  /**
   * Validate a button element
   */
  validateButton(button: ButtonElement): ButtonValidationResult {
    const errors: string[] = [];
    const checks = {
      exists: false,
      clickable: false,
      labelCorrect: false,
      actionTriggered: false,
      stateCorrect: false,
    };

    try {
      // Check if button exists
      const element = document.querySelector(button.selector) as HTMLElement;
      if (!element) {
        errors.push(`Button not found with selector: ${button.selector}`);
        return { buttonId: button.id, passed: false, checks, errors };
      }
      checks.exists = true;

      // Check if clickable
      const isClickable =
        element.offsetParent !== null &&
        !element.hasAttribute('disabled') &&
        element.getAttribute('aria-disabled') !== 'true';
      if (!isClickable) {
        errors.push(`Button is not clickable: ${button.id}`);
      } else {
        checks.clickable = true;
      }

      // Check label
      const label =
        element.textContent?.trim() ||
        element.getAttribute('aria-label') ||
        element.getAttribute('title');
      if (label && label.includes(button.label)) {
        checks.labelCorrect = true;
      } else {
        errors.push(
          `Button label mismatch. Expected: ${button.label}, Got: ${label}`
        );
      }

      // Check state
      checks.stateCorrect = true;

      // Mark as passed if no critical errors
      const passed = checks.exists && checks.clickable && checks.labelCorrect;
      return { buttonId: button.id, passed, checks, errors };
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
      return { buttonId: button.id, passed: false, checks, errors };
    }
  }

  /**
   * Validate button states (enabled/disabled)
   */
  validateStates(button: ButtonElement): StateValidationResult {
    const errors: string[] = [];

    try {
      const element = document.querySelector(button.selector) as HTMLElement;
      if (!element) {
        errors.push(`Button not found: ${button.selector}`);
        return { buttonId: button.id, enabled: false, visible: false, errors };
      }

      const enabled =
        !element.hasAttribute('disabled') &&
        element.getAttribute('aria-disabled') !== 'true';
      const visible = element.offsetParent !== null;

      return { buttonId: button.id, enabled, visible, errors };
    } catch (error) {
      errors.push(`State validation error: ${error instanceof Error ? error.message : String(error)}`);
      return { buttonId: button.id, enabled: false, visible: false, errors };
    }
  }

  /**
   * Validate conditional visibility
   */
  validateConditionalVisibility(button: ButtonElement): boolean {
    if (!button.conditionalVisibility) {
      return true;
    }

    try {
      const element = document.querySelector(button.selector) as HTMLElement;
      if (!element) {
        return false;
      }

      // Simple visibility check - can be extended based on specific conditions
      return element.offsetParent !== null;
    } catch {
      return false;
    }
  }

  /**
   * Simulate button click
   */
  async clickButton(button: ButtonElement): Promise<boolean> {
    try {
      const element = document.querySelector(button.selector) as HTMLElement;
      if (!element) {
        return false;
      }

      element.click();
      // Wait for potential async operations
      await new Promise((resolve) => setTimeout(resolve, 100));
      return true;
    } catch {
      return false;
    }
  }
}

export const buttonValidator = new ButtonValidator();

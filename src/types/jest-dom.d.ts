import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveClass(className: string): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeChecked(): R;
      toHaveFocus(): R;
      toBeEmpty(): R;
      toHaveValue(value: string | string[] | number): R;
      toBeRequired(): R;
      toContainElement(element: HTMLElement | null): R;
      toBeInvalid(): R;
      toBeValid(): R;
    }
  }
} 
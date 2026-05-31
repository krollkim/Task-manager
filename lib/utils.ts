/**
 * Shared utility functions for Next.js application
 */

/**
 * Sleep utility for testing and delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Type guard for Error objects
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse date from string (YYYY-MM-DD)
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00Z');
}

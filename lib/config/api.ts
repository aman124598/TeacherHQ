/**
 * API Configuration for web and mobile builds
 * 
 * For web (Vercel): Uses relative URLs (/api/...)
 * For mobile (Capacitor): Uses absolute URLs to the deployed API
 */

// Set this to your Vercel deployment URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - The API endpoint (e.g., '/api/attendance/mark')
 * @returns The full URL to the API endpoint
 */
export function getApiUrl(endpoint: string): string {
  // If we have a base URL configured (for mobile), use it
  if (API_BASE_URL) {
    return `${API_BASE_URL}${endpoint}`;
  }
  // Otherwise, use relative URLs (for web)
  return endpoint;
}

/**
 * Check if the app is running in a Capacitor context
 */
export function isCapacitor(): boolean {
  if (typeof window !== 'undefined') {
    return !!(window as any).Capacitor;
  }
  return false;
}

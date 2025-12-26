
import { LANGUAGES } from './language-config';

/**
 * Generates a unique ID for messages.
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Wraps an async function with retry logic and exponential backoff.
 */
export async function withRetry<T>(
  asyncFn: () => Promise<T>,
  onRetry: (attempt: number, delay: number, maxRetries: number) => void,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let attempt = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await asyncFn();
    } catch (error: any) {
      attempt++;
      const errorString = JSON.stringify(error).toLowerCase();
      
      // Check for fatal errors that should not be retried (e.g., invalid API key)
      if (errorString.includes('api_key') || errorString.includes('permission_denied')) {
        throw error;
      }

      const isRateLimit = errorString.includes('429') || errorString.includes('resource_exhausted') || errorString.includes('overloaded');

      if (attempt <= maxRetries && (isRateLimit || errorString.includes('fetch failed'))) {
        onRetry(attempt, delay, maxRetries);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      
      throw error;
    }
  }
}

export const handleApiError = (error: unknown): string => {
    console.error('API Error:', error);
    const errorString = (typeof error === 'object' && error !== null) 
        ? JSON.stringify(error).toLowerCase() 
        : String(error).toLowerCase();
    
    if (errorString.includes('429') || errorString.includes('resource_exhausted')) {
        return 'Der Professor ist momentan sehr gefragt (Rate Limit). Bitte warte einen Moment und versuche es erneut. ☕';
    }
    
    if (errorString.includes('api_key')) {
        return 'Konfigurationsfehler: Der API-Schlüssel fehlt oder ist ungültig.';
    }

    if (errorString.includes('aborted')) {
        return 'Die Anfrage wurde abgebrochen.';
    }

    return 'Ein unerwarteter Kommunikationsfehler ist aufgetreten.';
};

export const findCategoryForModule = (langKey: string, moduleId: number): string | null => {
    const lang = LANGUAGES[langKey as keyof typeof LANGUAGES];
    if (!lang) return null;
    for (const category of lang.categories) {
        if (category.modules.some(m => m.id === moduleId)) {
            return category.category;
        }
    }
    return null;
};

/**
 * Input validation and sanitization utilities
 */

// Maximum length for search queries
const MAX_SEARCH_LENGTH = 100;

// Characters to escape in search queries
const SEARCH_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;'
};

/**
 * Sanitize a string by escaping special characters
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'\/`]/g, char => SEARCH_ESCAPE_MAP[char]);
}

/**
 * Validate and sanitize a search query
 */
export function validateSearchQuery(query: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  // Trim whitespace
  const trimmed = query.trim();

  // Check length
  if (trimmed.length > MAX_SEARCH_LENGTH) {
    return {
      isValid: false,
      sanitized: trimmed.slice(0, MAX_SEARCH_LENGTH),
      error: `Search query too long (max ${MAX_SEARCH_LENGTH} characters)`
    };
  }

  // Check for empty query after trimming
  if (!trimmed) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Search query cannot be empty'
    };
  }

  // Sanitize the query
  const sanitized = escapeHtml(trimmed);

  return {
    isValid: true,
    sanitized
  };
}

/**
 * Validate and sanitize URL parameters
 */
export function validateUrlParam(param: string | null, maxLength = 100): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  if (!param) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Parameter is required'
    };
  }

  // Trim whitespace
  const trimmed = param.trim();

  // Check length
  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      sanitized: trimmed.slice(0, maxLength),
      error: `Parameter too long (max ${maxLength} characters)`
    };
  }

  // Sanitize the parameter
  const sanitized = escapeHtml(trimmed);

  return {
    isValid: true,
    sanitized
  };
}

/**
 * Validate and sanitize API request parameters
 */
export function validateApiParams(params: Record<string, unknown>): {
  isValid: boolean;
  sanitized: Record<string, string>;
  errors: Record<string, string>;
} {
  const sanitized: Record<string, string> = {};
  const errors: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    // Skip null or undefined values
    if (value == null) {
      errors[key] = 'Parameter is required';
      continue;
    }

    // Convert to string and validate
    const strValue = String(value);
    const result = validateUrlParam(strValue);

    if (!result.isValid) {
      errors[key] = result.error || 'Invalid parameter';
    }

    sanitized[key] = result.sanitized;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    sanitized,
    errors
  };
}

/**
 * Create a safe URL by validating and encoding parameters
 */
export function createSafeUrl(baseUrl: string, params: Record<string, string>): string {
  const validatedParams = validateApiParams(params);
  
  if (!validatedParams.isValid) {
    // Log validation errors but still create a safe URL
    console.warn('URL parameter validation failed:', validatedParams.errors);
  }

  const searchParams = new URLSearchParams();
  
  // Use sanitized values even if validation failed
  Object.entries(validatedParams.sanitized).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value);
    }
  });

  const search = searchParams.toString();
  return search ? `${baseUrl}?${search}` : baseUrl;
}

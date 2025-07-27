/**
 * Input validation and sanitization utilities
 */

/**
 * Sanitize string input to prevent XSS
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>'"&]/g, (char) => {
      const entities = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    })
    .trim();
};

/**
 * Validate share code format
 * @param {string} shareCode - Share code to validate
 * @returns {{isValid: boolean, error?: string}}
 */
export const validateShareCode = (shareCode) => {
  if (!shareCode) {
    return { isValid: false, error: 'Share code is required' };
  }
  
  const cleaned = shareCode.trim().toUpperCase();
  
  if (cleaned.length < 4 || cleaned.length > 8) {
    return { isValid: false, error: 'Share code must be 4-8 characters long' };
  }
  
  if (!/^[A-Z0-9]+$/.test(cleaned)) {
    return { isValid: false, error: 'Share code must contain only letters and numbers' };
  }
  
  return { isValid: true };
};

/**
 * Validate file name
 * @param {string} fileName - File name to validate
 * @returns {{isValid: boolean, error?: string}}
 */
export const validateFileName = (fileName) => {
  if (!fileName) {
    return { isValid: false, error: 'File name is required' };
  }
  
  // Check for dangerous patterns
  const dangerousPatterns = [
    /\.\./,  // Directory traversal
    /[<>:"|?*\x00-\x1f]/,  // Windows invalid chars
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i,  // Windows reserved names
    /^\./,  // Hidden files (optional)
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(fileName)) {
      return { isValid: false, error: 'File name contains invalid characters' };
    }
  }
  
  if (fileName.length > 255) {
    return { isValid: false, error: 'File name is too long' };
  }
  
  return { isValid: true };
};

/**
 * Validate file size
 * @param {number} fileSize - File size in bytes
 * @param {number} maxSize - Maximum allowed size in bytes (default 50MB)
 * @returns {{isValid: boolean, error?: string}}
 */
export const validateFileSize = (fileSize, maxSize = 50 * 1024 * 1024) => {
  if (!fileSize || fileSize <= 0) {
    return { isValid: false, error: 'Invalid file size' };
  }
  
  if (fileSize > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return { isValid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }
  
  return { isValid: true };
};

/**
 * Validate file type
 * @param {string} fileName - File name
 * @param {string} mimeType - MIME type
 * @param {string[]} allowedTypes - Array of allowed MIME types (optional)
 * @returns {{isValid: boolean, error?: string}}
 */
export const validateFileType = (fileName, mimeType, allowedTypes = null) => {
  // Block potentially dangerous file types
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr',
    '.vbs', '.js', '.jar', '.app', '.deb', '.pkg',
    '.dmg', '.msi', '.dll', '.sys'
  ];
  
  const fileExtension = fileName.toLowerCase().split('.').pop();
  
  if (dangerousExtensions.some(ext => fileName.toLowerCase().endsWith(ext))) {
    return { isValid: false, error: 'File type not allowed for security reasons' };
  }
  
  if (allowedTypes && !allowedTypes.includes(mimeType)) {
    return { isValid: false, error: 'File type not supported' };
  }
  
  return { isValid: true };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {object} options - Validation options
 * @returns {{isValid: boolean, score: number, errors: string[]}}
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
    maxLength = 128
  } = options;
  
  const errors = [];
  let score = 0;
  
  if (!password) {
    return { isValid: false, score: 0, errors: ['Password is required'] };
  }
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  } else {
    score += 1;
  }
  
  if (password.length > maxLength) {
    errors.push(`Password must be no more than ${maxLength} characters long`);
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (requireUppercase) {
    score += 1;
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (requireLowercase) {
    score += 1;
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (requireNumbers) {
    score += 1;
  }
  
  if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else if (requireSpecialChars) {
    score += 1;
  }
  
  // Additional security checks
  if (password.toLowerCase() === 'password' || 
      password === '123456' || 
      password === 'qwerty') {
    errors.push('Password is too common');
    score = 0;
  }
  
  const isValid = errors.length === 0;
  
  return { isValid, score, errors };
};

/**
 * Rate limiting helper
 */
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) { // 5 attempts per 15 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }
  
  isAllowed(identifier) {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Record this attempt
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    
    return true;
  }
  
  getRemainingTime(identifier) {
    const userAttempts = this.attempts.get(identifier) || [];
    if (userAttempts.length < this.maxAttempts) {
      return 0;
    }
    
    const oldestAttempt = Math.min(...userAttempts);
    const remainingTime = this.windowMs - (Date.now() - oldestAttempt);
    
    return Math.max(0, remainingTime);
  }
  
  reset(identifier) {
    this.attempts.delete(identifier);
  }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Validate and sanitize URL
 * @param {string} url - URL to validate
 * @returns {{isValid: boolean, sanitizedUrl?: string, error?: string}}
 */
export const validateUrl = (url) => {
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }
    
    return { isValid: true, sanitizedUrl: urlObj.toString() };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

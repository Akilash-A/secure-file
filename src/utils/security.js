/**
 * Security configuration for the application
 */

/**
 * Content Security Policy configuration
 */
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"], // Note: Consider removing unsafe-inline in production
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", "data:", "blob:"],
  'font-src': ["'self'"],
  'connect-src': ["'self'"],
  'media-src': ["'self'", "blob:"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

/**
 * Apply Content Security Policy to the document
 */
export const applyCSP = () => {
  if (typeof document !== 'undefined') {
    const cspString = Object.entries(CSP_CONFIG)
      .map(([directive, values]) => `${directive} ${values.join(' ')}`)
      .join('; ');
    
    // Create or update CSP meta tag
    let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!cspMeta) {
      cspMeta = document.createElement('meta');
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
      document.head.appendChild(cspMeta);
    }
    cspMeta.setAttribute('content', cspString);
  }
};

/**
 * Apply security headers (for environments that support it)
 */
export const applySecurityHeaders = () => {
  // This would typically be handled by a server or service worker
  // For client-side applications, we can only apply what's possible via meta tags
  
  if (typeof document !== 'undefined') {
    // Apply X-Content-Type-Options
    let nosniffMeta = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
    if (!nosniffMeta) {
      nosniffMeta = document.createElement('meta');
      nosniffMeta.setAttribute('http-equiv', 'X-Content-Type-Options');
      nosniffMeta.setAttribute('content', 'nosniff');
      document.head.appendChild(nosniffMeta);
    }
    
    // Apply Referrer Policy
    let referrerMeta = document.querySelector('meta[name="referrer"]');
    if (!referrerMeta) {
      referrerMeta = document.createElement('meta');
      referrerMeta.setAttribute('name', 'referrer');
      referrerMeta.setAttribute('content', 'strict-origin-when-cross-origin');
      document.head.appendChild(referrerMeta);
    }
  }
};

/**
 * Initialize security configurations
 */
export const initializeSecurity = () => {
  try {
    applyCSP();
    applySecurityHeaders();
    
    // Disable right-click context menu in production
    if (process.env.NODE_ENV === 'production') {
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
      
      // Disable certain key combinations
      document.addEventListener('keydown', (e) => {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault();
        }
      });
    }
    
    console.info('Security configurations applied');
  } catch (error) {
    console.error('Failed to apply security configurations:', error);
  }
};

/**
 * Secure fetch wrapper with additional security checks
 */
export const secureFetch = async (url, options = {}) => {
  try {
    // Validate URL
    const urlObj = new URL(url);
    
    // Only allow HTTPS in production
    if (process.env.NODE_ENV === 'production' && urlObj.protocol !== 'https:') {
      throw new Error('Only HTTPS requests are allowed in production');
    }
    
    // Set secure defaults
    const secureOptions = {
      ...options,
      mode: options.mode || 'cors',
      credentials: options.credentials || 'same-origin',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers
      }
    };
    
    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);
    
    secureOptions.signal = controller.signal;
    
    try {
      const response = await fetch(url, secureOptions);
      clearTimeout(timeoutId);
      
      // Check response headers for security
      const contentType = response.headers.get('Content-Type');
      if (contentType && !contentType.startsWith('application/json') && !contentType.startsWith('text/')) {
        console.warn('Unexpected content type:', contentType);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    throw new Error(`Secure fetch failed: ${error.message}`);
  }
};

/**
 * Check if the current environment is secure
 */
export const isSecureContext = () => {
  if (typeof window !== 'undefined') {
    return window.isSecureContext;
  }
  return true; // Assume secure in non-browser environments
};

/**
 * Generate a nonce for inline scripts/styles
 */
export const generateNonce = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};

/**
 * Sanitize HTML content to prevent XSS
 */
export const sanitizeHTML = (html) => {
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove script tags
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove dangerous attributes
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(element => {
      // Remove event handlers
      Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('on')) {
          element.removeAttribute(attr.name);
        }
      });
      
      // Remove javascript: links
      if (element.href && element.href.startsWith('javascript:')) {
        element.removeAttribute('href');
      }
    });
    
    return doc.body.innerHTML;
  }
  
  // Fallback for environments without DOMParser
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
             .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
             .replace(/javascript:[^"']*/gi, '');
};

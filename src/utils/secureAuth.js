/**
 * Secure authentication utilities
 */

/**
 * Creates a secure hash of a password using Web Crypto API
 * @param {string} password - The password to hash
 * @param {string} salt - Optional salt (will be generated if not provided)
 * @returns {Promise<{hash: string, salt: string}>}
 */
export const hashPassword = async (password, salt = null) => {
  try {
    // Generate salt if not provided
    if (!salt) {
      const saltBuffer = new Uint8Array(16);
      crypto.getRandomValues(saltBuffer);
      salt = Array.from(saltBuffer).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Convert password and salt to buffers
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const saltBuffer = encoder.encode(salt);
    
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    // Derive hash using PBKDF2
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 100000, // High iteration count for security
        hash: 'SHA-256'
      },
      keyMaterial,
      256 // 256 bits = 32 bytes
    );
    
    // Convert to hex string
    const hashArray = new Uint8Array(hashBuffer);
    const hash = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
    
    return { hash, salt };
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
};

/**
 * Verifies a password against a stored hash using constant-time comparison
 * @param {string} password - The password to verify
 * @param {string} storedHash - The stored hash
 * @param {string} salt - The salt used for hashing
 * @returns {Promise<boolean>}
 */
export const verifyPassword = async (password, storedHash, salt) => {
  try {
    const { hash } = await hashPassword(password, salt);
    
    // Constant-time comparison to prevent timing attacks
    return constantTimeEqual(hash, storedHash);
  } catch (error) {
    // Always return false on error to prevent information disclosure
    return false;
  }
};

/**
 * Constant-time string comparison to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean}
 */
const constantTimeEqual = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {{isValid: boolean, score: number, feedback: string[]}}
 */
export const validatePasswordStrength = (password) => {
  const feedback = [];
  let score = 0;
  
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else {
    score += 1;
  }
  
  if (password.length >= 12) {
    score += 1;
  }
  
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain lowercase letters');
  }
  
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain uppercase letters');
  }
  
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain numbers');
  }
  
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain special characters');
  }
  
  const isValid = score >= 4 && password.length >= 8;
  
  return {
    isValid,
    score,
    feedback: feedback.length > 0 ? feedback : ['Password strength is good']
  };
};

/**
 * Generate a cryptographically secure random string
 * @param {number} length - Length of the string
 * @param {string} charset - Character set to use
 * @returns {string}
 */
export const generateSecureRandom = (length, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(randomValues[i] % charset.length);
  }
  
  return result;
};

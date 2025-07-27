/**
 * Secure storage utility that provides encryption for sensitive data
 * Uses Web Crypto API for client-side encryption before storing
 */

class SecureStorage {
  constructor() {
    this.storageKey = 'secure_app_data';
    this.encryptionKey = null;
    this.initialized = false;
  }

  /**
   * Initialize secure storage with encryption
   * @param {string} userPassword - User password for key derivation
   */
  async initialize(userPassword = null) {
    try {
      if (userPassword) {
        // Derive encryption key from user password
        this.encryptionKey = await this.deriveKeyFromPassword(userPassword);
      } else {
        // Generate or retrieve encryption key
        this.encryptionKey = await this.getOrCreateKey();
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize secure storage:', error);
      throw new Error('Secure storage initialization failed');
    }
  }

  /**
   * Derive encryption key from password using PBKDF2
   */
  async deriveKeyFromPassword(password) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Get or generate salt
    let salt = localStorage.getItem('storage_salt');
    if (!salt) {
      const saltBuffer = new Uint8Array(16);
      crypto.getRandomValues(saltBuffer);
      salt = Array.from(saltBuffer).map(b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem('storage_salt', salt);
    }
    
    const saltBuffer = new Uint8Array(salt.match(/.{2}/g).map(byte => parseInt(byte, 16)));
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    return await crypto.subtle.importKey(
      'raw',
      derivedBits,
      'AES-GCM',
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate or retrieve encryption key for session-based encryption
   */
  async getOrCreateKey() {
    // For session-based storage, generate a new key each session
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data before storage
   */
  async encryptData(data) {
    if (!this.initialized || !this.encryptionKey) {
      throw new Error('Secure storage not initialized');
    }

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      this.encryptionKey,
      dataBuffer
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt data after retrieval
   */
  async decryptData(encryptedData) {
    if (!this.initialized || !this.encryptionKey) {
      throw new Error('Secure storage not initialized');
    }

    try {
      // Convert from base64
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );
      
      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);
      
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey,
        encrypted
      );
      
      const decoder = new TextDecoder();
      const decryptedString = decoder.decode(decryptedBuffer);
      
      return JSON.parse(decryptedString);
    } catch (error) {
      throw new Error('Failed to decrypt stored data');
    }
  }

  /**
   * Store encrypted data
   */
  async setItem(key, value) {
    try {
      const encryptedValue = await this.encryptData(value);
      
      // Use sessionStorage instead of localStorage for better security
      sessionStorage.setItem(`${this.storageKey}_${key}`, encryptedValue);
      
      return true;
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      return false;
    }
  }

  /**
   * Retrieve and decrypt data
   */
  async getItem(key) {
    try {
      const encryptedValue = sessionStorage.getItem(`${this.storageKey}_${key}`);
      
      if (!encryptedValue) {
        return null;
      }
      
      return await this.decryptData(encryptedValue);
    } catch (error) {
      console.error('Failed to retrieve encrypted data:', error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key) {
    sessionStorage.removeItem(`${this.storageKey}_${key}`);
  }

  /**
   * Clear all secure storage
   */
  clear() {
    // Remove all items with our prefix
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(this.storageKey)) {
        sessionStorage.removeItem(key);
      }
    });
  }

  /**
   * Check if storage is available and working
   */
  isAvailable() {
    try {
      const testKey = 'test_storage';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export default new SecureStorage();

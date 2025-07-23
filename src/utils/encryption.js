import * as Crypto from 'expo-crypto';

// Generate a random encryption key
export const generateKey = async () => {
  const key = await Crypto.getRandomBytesAsync(32); // 256 bits
  return Array.from(key).map(b => b.toString(16).padStart(2, '0')).join('');
};

// Generate initialization vector
export const generateIV = async () => {
  const iv = await Crypto.getRandomBytesAsync(16); // 128 bits
  return Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
};

// Convert hex string to Uint8Array
const hexToUint8Array = (hex) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
};

// Convert Uint8Array to hex string
const uint8ArrayToHex = (bytes) => {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
};

// Encrypt file data
export const encryptData = async (data, key, iv) => {
  try {
    // Convert hex strings to Uint8Arrays
    const keyBytes = hexToUint8Array(key);
    const ivBytes = hexToUint8Array(iv);
    
    // Import the key for WebCrypto
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-CBC' },
      false,
      ['encrypt']
    );

    // Convert data to ArrayBuffer
    const dataBuffer = new TextEncoder().encode(data);
    
    // Encrypt the data
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-CBC',
        iv: ivBytes,
      },
      cryptoKey,
      dataBuffer
    );

    // Convert to hex string for storage
    return uint8ArrayToHex(new Uint8Array(encryptedBuffer));
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

// Decrypt file data
export const decryptData = async (encryptedData, key, iv) => {
  try {
    // Convert hex strings to Uint8Arrays
    const keyBytes = hexToUint8Array(key);
    const ivBytes = hexToUint8Array(iv);
    const encryptedBytes = hexToUint8Array(encryptedData);
    
    // Import the key for WebCrypto
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );
    
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv: ivBytes,
      },
      cryptoKey,
      encryptedBytes
    );

    // Convert back to string
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

// Generate a secure password
export const generateSecurePassword = async (length = 16) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  
  return password;
};

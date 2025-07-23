/**
 * Demo script to test encryption functionality
 * Run with: node demo.js
 */

// Polyfill for Node.js environment
if (typeof crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto;
}

// Simple implementation for demo
const generateKey = async () => {
  const key = new Uint8Array(32);
  crypto.getRandomValues(key);
  return Array.from(key).map(b => b.toString(16).padStart(2, '0')).join('');
};

const generateIV = async () => {
  const iv = new Uint8Array(16);
  crypto.getRandomValues(iv);
  return Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
};

const hexToUint8Array = (hex) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
};

const uint8ArrayToHex = (bytes) => {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
};

const encryptData = async (data, key, iv) => {
  const keyBytes = hexToUint8Array(key);
  const ivBytes = hexToUint8Array(iv);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-CBC' },
    false,
    ['encrypt']
  );

  const dataBuffer = new TextEncoder().encode(data);
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: ivBytes },
    cryptoKey,
    dataBuffer
  );

  return uint8ArrayToHex(new Uint8Array(encryptedBuffer));
};

const decryptData = async (encryptedData, key, iv) => {
  const keyBytes = hexToUint8Array(key);
  const ivBytes = hexToUint8Array(iv);
  const encryptedBytes = hexToUint8Array(encryptedData);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-CBC' },
    false,
    ['decrypt']
  );
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: ivBytes },
    cryptoKey,
    encryptedBytes
  );

  return new TextDecoder().decode(decryptedBuffer);
};

// Demo function
async function demo() {
  console.log('🔒 Secure File Transfer - Encryption Demo');
  console.log('=========================================\n');

  const originalData = 'This is a secret message that will be encrypted using AES-256!';
  console.log('📄 Original Data:', originalData);

  // Generate encryption parameters
  const key = await generateKey();
  const iv = await generateIV();
  
  console.log('🔑 Generated Key:', key.substring(0, 16) + '...');
  console.log('🎲 Generated IV:', iv.substring(0, 16) + '...');

  // Encrypt
  console.log('\n🔒 Encrypting...');
  const encryptedData = await encryptData(originalData, key, iv);
  console.log('✅ Encrypted Data:', encryptedData.substring(0, 32) + '...');

  // Decrypt
  console.log('\n🔓 Decrypting...');
  const decryptedData = await decryptData(encryptedData, key, iv);
  console.log('✅ Decrypted Data:', decryptedData);

  // Verify
  const isValid = originalData === decryptedData;
  console.log('\n✨ Verification:', isValid ? '✅ SUCCESS' : '❌ FAILED');
  
  if (isValid) {
    console.log('🎉 Encryption and decryption working perfectly!');
  }
}

// Run demo if this file is executed directly
if (require.main === module) {
  demo().catch(console.error);
}

module.exports = { demo, encryptData, decryptData, generateKey, generateIV };

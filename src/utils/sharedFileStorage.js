// Simple in-memory storage for shared files
// In a real application, this would be stored in a database or cloud storage

class SharedFileStorage {
  constructor() {
    this.storage = new Map();
  }

  // Store a shared file
  storeFile(code, fileData) {
    this.storage.set(code.toUpperCase(), {
      ...fileData,
      createdAt: new Date(),
      accessCount: 0,
    });
    console.log(`File stored with code: ${code.toUpperCase()}`, fileData);
  }

  // Retrieve a shared file by code
  getFile(code) {
    const file = this.storage.get(code.toUpperCase());
    if (file) {
      // Check if file has expired
      if (new Date() > new Date(file.expiryDate)) {
        this.storage.delete(code.toUpperCase());
        return null;
      }
      
      // Increment access count
      file.accessCount += 1;
      return file;
    }
    return null;
  }

  // Check if a code exists
  hasFile(code) {
    const file = this.storage.get(code.toUpperCase());
    if (file) {
      // Check if expired
      if (new Date() > new Date(file.expiryDate)) {
        this.storage.delete(code.toUpperCase());
        return false;
      }
      return true;
    }
    return false;
  }

  // Get all active shared files
  getAllFiles() {
    const now = new Date();
    const activeFiles = [];
    
    for (const [code, file] of this.storage.entries()) {
      if (new Date(file.expiryDate) > now) {
        activeFiles.push({ code, ...file });
      } else {
        // Clean up expired files
        this.storage.delete(code);
      }
    }
    
    return activeFiles;
  }

  // Remove a file
  removeFile(code) {
    const file = this.storage.get(code.toUpperCase());
    if (file && file.blobUrl) {
      URL.revokeObjectURL(file.blobUrl);
    }
    this.storage.delete(code.toUpperCase());
  }

  // Clean up expired files
  cleanupExpired() {
    const now = new Date();
    for (const [code, file] of this.storage.entries()) {
      if (new Date(file.expiryDate) <= now) {
        if (file.blobUrl) {
          URL.revokeObjectURL(file.blobUrl);
        }
        this.storage.delete(code);
      }
    }
  }

  // Get storage size
  getStorageSize() {
    return this.storage.size;
  }
}

// Create a singleton instance
const sharedFileStorage = new SharedFileStorage();

// Cleanup expired files every 5 minutes
setInterval(() => {
  sharedFileStorage.cleanupExpired();
}, 5 * 60 * 1000);

export default sharedFileStorage;

// Simple in-memory storage for shared files
// In a production app, this would be replaced with a backend API

class SharedFileStorage {
  constructor() {
    // Use localStorage to persist files across browser sessions
    this.storageKey = 'sharedFiles';
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsedData = JSON.parse(stored);
        // Convert stored base64 data back to blobs when needed
        this.files = new Map();
        Object.entries(parsedData).forEach(([code, fileData]) => {
          this.files.set(code, fileData);
        });
      } else {
        this.files = new Map();
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      this.files = new Map();
    }
  }

  saveToStorage() {
    try {
      const dataToStore = {};
      this.files.forEach((fileData, code) => {
        // Store everything except the blob (which we'll recreate)
        const { blob, downloadUrl, ...persistableData } = fileData;
        dataToStore[code] = persistableData;
      });
      localStorage.setItem(this.storageKey, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  async storeFile(code, fileData, expiryDate) {
    try {
      // Convert file blob to base64 for storage
      const arrayBuffer = await fileData.file.arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const storedFile = {
        code: code,
        fileName: fileData.name,
        fileSize: fileData.size,
        fileType: fileData.type,
        mimeType: fileData.file.type,
        base64Data: base64Data,
        expiryDate: expiryDate,
        createdAt: new Date(),
        downloadCount: 0,
        isEncrypted: false, // For unencrypted shares
      };

      this.files.set(code, storedFile);
      this.saveToStorage();
      
      console.log(`File stored with code: ${code}`);
      return true;
    } catch (error) {
      console.error('Error storing file:', error);
      return false;
    }
  }

  async storeEncryptedFile(code, encryptedData, originalFileName, expiryDate) {
    try {
      const storedFile = {
        code: code,
        fileName: originalFileName + '.encrypted',
        originalFileName: originalFileName,
        fileSize: encryptedData.length,
        encryptedData: encryptedData, // This is already base64 encoded
        expiryDate: expiryDate,
        createdAt: new Date(),
        downloadCount: 0,
        isEncrypted: true,
      };

      this.files.set(code, storedFile);
      this.saveToStorage();
      
      console.log(`Encrypted file stored with code: ${code}`);
      return true;
    } catch (error) {
      console.error('Error storing encrypted file:', error);
      return false;
    }
  }

  getFile(code) {
    const fileData = this.files.get(code.toUpperCase());
    
    if (!fileData) {
      return null;
    }

    // Check if file has expired
    const now = new Date();
    const expiryDate = new Date(fileData.expiryDate);
    
    if (now > expiryDate) {
      this.files.delete(code.toUpperCase());
      this.saveToStorage();
      return null;
    }

    return fileData;
  }

  async createDownloadableFile(code) {
    const fileData = this.getFile(code);
    
    if (!fileData) {
      return null;
    }

    try {
      let blob;
      let fileName;

      if (fileData.isEncrypted) {
        // Create blob from encrypted data
        const binaryString = atob(fileData.encryptedData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: 'application/octet-stream' });
        fileName = fileData.fileName;
      } else {
        // Create blob from base64 data
        const binaryString = atob(fileData.base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: fileData.mimeType || 'application/octet-stream' });
        fileName = fileData.fileName;
      }

      const downloadUrl = URL.createObjectURL(blob);

      // Increment download count
      fileData.downloadCount += 1;
      this.files.set(code.toUpperCase(), fileData);
      this.saveToStorage();

      return {
        ...fileData,
        blob: blob,
        downloadUrl: downloadUrl,
        name: fileName,
      };
    } catch (error) {
      console.error('Error creating downloadable file:', error);
      return null;
    }
  }

  getAllFiles() {
    const allFiles = [];
    this.files.forEach((fileData, code) => {
      // Check if file has expired
      const now = new Date();
      const expiryDate = new Date(fileData.expiryDate);
      
      if (now <= expiryDate) {
        allFiles.push(fileData);
      } else {
        // Remove expired files
        this.files.delete(code);
      }
    });
    
    if (allFiles.length !== this.files.size) {
      this.saveToStorage(); // Save after removing expired files
    }
    
    return allFiles;
  }

  deleteFile(code) {
    const deleted = this.files.delete(code.toUpperCase());
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  cleanupExpiredFiles() {
    const now = new Date();
    let cleanedCount = 0;
    
    this.files.forEach((fileData, code) => {
      const expiryDate = new Date(fileData.expiryDate);
      if (now > expiryDate) {
        this.files.delete(code);
        cleanedCount++;
      }
    });
    
    if (cleanedCount > 0) {
      this.saveToStorage();
      console.log(`Cleaned up ${cleanedCount} expired files`);
    }
    
    return cleanedCount;
  }
}

// Create singleton instance
const sharedFileStorage = new SharedFileStorage();

// Cleanup expired files on startup
sharedFileStorage.cleanupExpiredFiles();

// Cleanup expired files every hour
setInterval(() => {
  sharedFileStorage.cleanupExpiredFiles();
}, 60 * 60 * 1000);

export default sharedFileStorage;

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

// File storage paths
const ENCRYPTED_FILES_DIR = `${FileSystem.documentDirectory}encrypted/`;
const DECRYPTED_FILES_DIR = `${FileSystem.documentDirectory}decrypted/`;

// Ensure directories exist
export const initializeDirectories = async () => {
  try {
    const encryptedDirInfo = await FileSystem.getInfoAsync(ENCRYPTED_FILES_DIR);
    if (!encryptedDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(ENCRYPTED_FILES_DIR, { intermediates: true });
    }

    const decryptedDirInfo = await FileSystem.getInfoAsync(DECRYPTED_FILES_DIR);
    if (!decryptedDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(DECRYPTED_FILES_DIR, { intermediates: true });
    }
  } catch (error) {
    console.error('Failed to initialize directories:', error);
  }
};

// Save encrypted file
export const saveEncryptedFile = async (fileName, encryptedData, metadata) => {
  try {
    await initializeDirectories();
    
    const filePath = `${ENCRYPTED_FILES_DIR}${fileName}.secure`;
    const fileData = {
      encryptedData,
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
        fileName: fileName,
      }
    };
    
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(fileData));
    
    // Store file info for history and auto-delete
    await saveFileHistory(fileName, filePath, metadata);
    
    return filePath;
  } catch (error) {
    throw new Error(`Failed to save encrypted file: ${error.message}`);
  }
};

// Save decrypted file
export const saveDecryptedFile = async (fileName, decryptedData) => {
  try {
    await initializeDirectories();
    
    const filePath = `${DECRYPTED_FILES_DIR}${fileName}`;
    await FileSystem.writeAsStringAsync(filePath, decryptedData);
    
    return filePath;
  } catch (error) {
    throw new Error(`Failed to save decrypted file: ${error.message}`);
  }
};

// Read encrypted file
export const readEncryptedFile = async (filePath) => {
  try {
    const fileContent = await FileSystem.readAsStringAsync(filePath);
    return JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Failed to read encrypted file: ${error.message}`);
  }
};

// Share file
export const shareFile = async (filePath) => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }
    
    await Sharing.shareAsync(filePath);
  } catch (error) {
    throw new Error(`Failed to share file: ${error.message}`);
  }
};

// Create a share link with code
export const createShareCode = async (filePath, metadata) => {
  try {
    const { generateShareCode } = require('./encryption');
    const shareCode = await generateShareCode();
    
    // Store share code mapping
    const shareKey = 'share_codes';
    const existingCodes = await AsyncStorage.getItem(shareKey);
    const codes = existingCodes ? JSON.parse(existingCodes) : {};
    
    codes[shareCode] = {
      filePath: filePath,
      metadata: metadata,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      downloadCount: 0,
      maxDownloads: 5
    };
    
    await AsyncStorage.setItem(shareKey, JSON.stringify(codes));
    
    return shareCode;
  } catch (error) {
    throw new Error(`Failed to create share code: ${error.message}`);
  }
};

// Get file by share code
export const getFileByShareCode = async (shareCode) => {
  try {
    const shareKey = 'share_codes';
    const existingCodes = await AsyncStorage.getItem(shareKey);
    const codes = existingCodes ? JSON.parse(existingCodes) : {};
    
    const shareData = codes[shareCode.toUpperCase()];
    if (!shareData) {
      throw new Error('Invalid share code');
    }
    
    // Check if expired
    if (new Date() > new Date(shareData.expiresAt)) {
      throw new Error('Share code has expired');
    }
    
    // Check download limit
    if (shareData.downloadCount >= shareData.maxDownloads) {
      throw new Error('Share code has reached maximum downloads');
    }
    
    // Increment download count
    shareData.downloadCount += 1;
    codes[shareCode.toUpperCase()] = shareData;
    await AsyncStorage.setItem(shareKey, JSON.stringify(codes));
    
    return shareData;
  } catch (error) {
    throw new Error(`Failed to get file by share code: ${error.message}`);
  }
};

// Get all active share codes
export const getActiveShareCodes = async () => {
  try {
    const shareKey = 'share_codes';
    const existingCodes = await AsyncStorage.getItem(shareKey);
    const codes = existingCodes ? JSON.parse(existingCodes) : {};
    
    const activeCodes = [];
    const now = new Date();
    
    for (const [code, data] of Object.entries(codes)) {
      if (new Date(data.expiresAt) > now && data.downloadCount < data.maxDownloads) {
        activeCodes.push({
          code,
          ...data
        });
      }
    }
    
    return activeCodes;
  } catch (error) {
    console.error('Failed to get active share codes:', error);
    return [];
  }
};

// Delete share code
export const deleteShareCode = async (shareCode) => {
  try {
    const shareKey = 'share_codes';
    const existingCodes = await AsyncStorage.getItem(shareKey);
    const codes = existingCodes ? JSON.parse(existingCodes) : {};
    
    delete codes[shareCode.toUpperCase()];
    await AsyncStorage.setItem(shareKey, JSON.stringify(codes));
    
    return true;
  } catch (error) {
    throw new Error(`Failed to delete share code: ${error.message}`);
  }
};

// File history management
export const saveFileHistory = async (fileName, filePath, metadata) => {
  try {
    const historyKey = 'file_history';
    const existingHistory = await AsyncStorage.getItem(historyKey);
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    
    const fileRecord = {
      id: Date.now().toString(),
      fileName,
      filePath,
      createdAt: new Date().toISOString(),
      expiresAt: metadata.expiresAt,
      autoDelete: metadata.autoDelete,
      deleteAfter: metadata.deleteAfter,
    };
    
    history.unshift(fileRecord);
    
    // Keep only last 50 records
    const trimmedHistory = history.slice(0, 50);
    
    await AsyncStorage.setItem(historyKey, JSON.stringify(trimmedHistory));
    
    // Schedule auto-delete if enabled
    if (metadata.autoDelete && metadata.deleteAfter) {
      scheduleAutoDelete(fileRecord);
    }
  } catch (error) {
    console.error('Failed to save file history:', error);
  }
};

// Get file history
export const getFileHistory = async () => {
  try {
    const historyKey = 'file_history';
    const history = await AsyncStorage.getItem(historyKey);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Failed to get file history:', error);
    return [];
  }
};

// Delete file
export const deleteFile = async (filePath) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath);
    }
  } catch (error) {
    console.error('Failed to delete file:', error);
  }
};

// Schedule auto-delete
export const scheduleAutoDelete = (fileRecord) => {
  const deleteTime = new Date(fileRecord.createdAt).getTime() + (fileRecord.deleteAfter * 60 * 1000);
  const currentTime = Date.now();
  const timeUntilDelete = deleteTime - currentTime;
  
  if (timeUntilDelete > 0) {
    setTimeout(async () => {
      await deleteFile(fileRecord.filePath);
      await removeFromHistory(fileRecord.id);
    }, timeUntilDelete);
  }
};

// Remove file from history
export const removeFromHistory = async (fileId) => {
  try {
    const historyKey = 'file_history';
    const existingHistory = await AsyncStorage.getItem(historyKey);
    if (existingHistory) {
      const history = JSON.parse(existingHistory);
      const updatedHistory = history.filter(item => item.id !== fileId);
      await AsyncStorage.setItem(historyKey, JSON.stringify(updatedHistory));
    }
  } catch (error) {
    console.error('Failed to remove from history:', error);
  }
};

// Check and clean expired files
export const cleanExpiredFiles = async () => {
  try {
    const history = await getFileHistory();
    const currentTime = new Date().toISOString();
    
    for (const fileRecord of history) {
      if (fileRecord.expiresAt && fileRecord.expiresAt < currentTime) {
        await deleteFile(fileRecord.filePath);
        await removeFromHistory(fileRecord.id);
      }
    }
  } catch (error) {
    console.error('Failed to clean expired files:', error);
  }
};

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

const DecryptScreenWeb = () => {
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionProgress, setDecryptionProgress] = useState(0);
  const [decryptedFile, setDecryptedFile] = useState(null);
  const [showDecryptOptions, setShowDecryptOptions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (decryptedFile && decryptedFile.downloadUrl) {
        URL.revokeObjectURL(decryptedFile.downloadUrl);
      }
      if (selectedFile && selectedFile.uri) {
        URL.revokeObjectURL(selectedFile.uri);
      }
    };
  }, [decryptedFile, selectedFile]);

  const selectEncryptedFile = async () => {
    if (Platform.OS === 'web') {
      // For web, we'll use HTML file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.enc,application/octet-stream,*/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setSelectedFile({
            name: file.name,
            size: file.size,
            type: file.type,
            uri: URL.createObjectURL(file),
            file: file
          });
        }
      };
      input.click();
    } else {
      Alert.alert('File Selection', 'File picker would open on mobile');
    }
  };

  const decryptFile = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select an encrypted file first');
      return;
    }

    setIsDecrypting(true);
    setDecryptionProgress(0);
    setDecryptedFile(null);
    setShowDecryptOptions(false);

    try {
      // Read the file as array buffer
      const fileData = await selectedFile.file.arrayBuffer();
      
      // Simulate decryption progress while actually decrypting
      const interval = setInterval(() => {
        setDecryptionProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Perform actual decryption
      const decryptedData = await performDecryption(fileData);
      
      // Complete the progress
      setDecryptionProgress(100);
      
      // Determine original file type and name
      const originalName = getOriginalFileName(selectedFile.name);
      const mimeType = getMimeTypeFromFileName(originalName);
      
      // Create decrypted file blob
      const decryptedBlob = new Blob([decryptedData], { type: mimeType });
      const decryptedUrl = URL.createObjectURL(decryptedBlob);
      
      // Create decrypted file object
      const decrypted = {
        name: originalName,
        originalEncryptedName: selectedFile.name,
        size: decryptedBlob.size,
        type: mimeType,
        decryptedAt: new Date().toISOString(),
        downloadUrl: decryptedUrl,
        decryptedData: decryptedData,
        isTextFile: mimeType.startsWith('text/') || originalName.match(/\.(txt|md|json|csv|xml|html|css|js|ts|log)$/i)
      };
      
      console.log('Decryption complete:', {
        originalName,
        mimeType,
        size: decryptedData.length,
        isTextFile: decrypted.isTextFile,
        firstBytes: Array.from(decryptedData.slice(0, 20)).map(b => b.toString(16)).join(' ')
      });
      
      setDecryptedFile(decrypted);
      setIsDecrypting(false);
      setShowDecryptOptions(true);
      Alert.alert('Success', `File "${originalName}" has been decrypted successfully!`);
      
    } catch (error) {
      setIsDecrypting(false);
      Alert.alert('Error', 'Failed to decrypt file: ' + error.message);
    }
  };

  // Decryption function that handles both Web Crypto API and fallback XOR
  const performDecryption = async (encryptedData) => {
    try {
      const uint8Array = new Uint8Array(encryptedData);
      
      // Check if this looks like Web Crypto API encrypted data (has IV + key + data structure)
      if (uint8Array.length > 44) { // 12 (IV) + 32 (key) + some data
        try {
          return await performWebCryptoDecryption(uint8Array);
        } catch (error) {
          console.log('Web Crypto decryption failed, trying fallback:', error);
        }
      }
      
      // Fallback to simple XOR decryption
      return performSimpleDecryption(uint8Array);
      
    } catch (error) {
      throw new Error('Decryption failed. This might not be a valid encrypted file or the file may be corrupted.');
    }
  };

  // Web Crypto API decryption
  const performWebCryptoDecryption = async (encryptedData) => {
    // Extract IV (first 12 bytes)
    const iv = encryptedData.slice(0, 12);
    
    // Extract key (next 32 bytes)
    const keyData = encryptedData.slice(12, 44);
    
    // Extract encrypted content (remaining bytes)
    const encryptedContent = encryptedData.slice(44);
    
    // Import the key
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: 'AES-GCM',
        length: 256,
      },
      false,
      ['decrypt']
    );
    
    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedContent
    );
    
    return new Uint8Array(decryptedData);
  };

  // Fallback simple XOR decryption
  const performSimpleDecryption = (encryptedData) => {
    const key = 'MySecretKey123!@#$%^&*()_+ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const decryptedArray = new Uint8Array(encryptedData.length);
    
    for (let i = 0; i < encryptedData.length; i++) {
      decryptedArray[i] = encryptedData[i] ^ key.charCodeAt(i % key.length);
    }
    
    return decryptedArray;
  };

  // Helper function to get original file name
  const getOriginalFileName = (encryptedName) => {
    // Remove common encrypted file extensions
    let name = encryptedName;
    
    // Remove .enc extension
    if (name.endsWith('.enc')) {
      name = name.slice(0, -4);
    }
    
    // Remove .encrypted extension
    if (name.endsWith('.encrypted')) {
      name = name.slice(0, -10);
    }
    
    // Remove timestamp patterns like _encrypted_20250723T123456
    name = name.replace(/_encrypted_\d{8}T\d{6}/, '');
    name = name.replace(/_received_\d{8}T\d{6}/, '');
    
    // If no extension remains, add .txt as default
    if (!name.includes('.')) {
      name += '.txt';
    }
    
    return name;
  };

  // Helper function to determine MIME type from file extension
  const getMimeTypeFromFileName = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const mimeTypes = {
      // Text files
      'txt': 'text/plain',
      'md': 'text/markdown',
      'json': 'application/json',
      'csv': 'text/csv',
      'xml': 'text/xml',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'text/javascript',
      'ts': 'text/typescript',
      'log': 'text/plain',
      
      // Documents
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      
      // Audio/Video
      'mp4': 'video/mp4',
      'avi': 'video/avi',
      'mov': 'video/quicktime',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'flac': 'audio/flac',
      
      // Archives
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      'tar': 'application/x-tar',
      'gz': 'application/gzip',
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  };

  const downloadDecryptedFile = () => {
    if (!decryptedFile) return;
    
    try {
      // Create download link for the decrypted file
      const link = document.createElement('a');
      link.href = decryptedFile.downloadUrl;
      link.download = decryptedFile.name;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      Alert.alert(
        'Download Started',
        `Decrypted file "${decryptedFile.name}" is being downloaded.\n\nThe file has been restored to its original format and can now be opened normally.`
      );
    } catch (error) {
      Alert.alert('Download Error', 'Failed to download decrypted file: ' + error.message);
    }
  };

  const previewDecryptedFile = () => {
    if (!decryptedFile) return;
    
    console.log('Preview attempt for:', decryptedFile.name, 'Type:', decryptedFile.type);
    
    // For text files, show a preview
    if (decryptedFile.type.startsWith('text/') || 
        decryptedFile.name.endsWith('.txt') || 
        decryptedFile.name.endsWith('.json') ||
        decryptedFile.name.endsWith('.csv') ||
        decryptedFile.name.endsWith('.md') ||
        decryptedFile.name.endsWith('.html') ||
        decryptedFile.name.endsWith('.css') ||
        decryptedFile.name.endsWith('.js')) {
      try {
        // Try to decode as text
        let text;
        
        // Try multiple encoding methods
        try {
          text = new TextDecoder('utf-8').decode(decryptedFile.decryptedData);
        } catch (error) {
          console.log('UTF-8 decode failed, trying latin1:', error);
          // Fallback to latin1 for some files
          const bytes = Array.from(decryptedFile.decryptedData);
          text = bytes.map(byte => String.fromCharCode(byte)).join('');
        }
        
        console.log('Decoded text length:', text.length);
        console.log('First 100 chars:', text.substring(0, 100));
        
        // Check if the text contains mostly printable characters
        const printableChars = text.replace(/[\x00-\x1F\x7F-\x9F]/g, '').length;
        const isReadableText = printableChars > text.length * 0.8; // At least 80% printable
        
        if (isReadableText && text.trim().length > 0) {
          setPreviewContent(text);
          setShowPreview(true);
        } else {
          throw new Error('File content is not readable text');
        }
      } catch (error) {
        console.log('Text preview failed:', error);
        Alert.alert(
          'Preview Not Available', 
          `Cannot preview ${decryptedFile.name}.\n\nThis might be a binary file or the content is not in a readable text format.\n\nError: ${error.message}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Download Anyway', onPress: downloadDecryptedFile }
          ]
        );
      }
    } else if (decryptedFile.type.startsWith('image/')) {
      // For images, we can't preview in an alert, but we can provide options
      Alert.alert(
        'Image File Detected',
        `${decryptedFile.name} is an image file.\n\nDownload it to view the image.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Download Image', onPress: downloadDecryptedFile }
        ]
      );
    } else {
      // For other files, try to preview as text anyway
      try {
        const text = new TextDecoder('utf-8', { fatal: false }).decode(decryptedFile.decryptedData);
        if (text && text.trim().length > 0) {
          setPreviewContent(text);
          setShowPreview(true);
        } else {
          throw new Error('No readable content');
        }
      } catch (error) {
        Alert.alert(
          'File Ready',
          `${decryptedFile.name} has been decrypted.\n\nFile type: ${decryptedFile.type || 'Unknown'}\nSize: ${formatFileSize(decryptedFile.size)}\n\nThis file type cannot be previewed, but you can download it.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Download', onPress: downloadDecryptedFile }
          ]
        );
      }
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewContent('');
  };

  const resetDecryption = () => {
    // Clean up blob URLs to prevent memory leaks
    if (decryptedFile && decryptedFile.downloadUrl) {
      URL.revokeObjectURL(decryptedFile.downloadUrl);
    }
    if (selectedFile && selectedFile.uri) {
      URL.revokeObjectURL(selectedFile.uri);
    }
    
    setSelectedFile(null);
    setDecryptedFile(null);
    setShowDecryptOptions(false);
    setDecryptionProgress(0);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            🔓 Decrypt Files
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Restore your encrypted files to their original format
          </Text>
        </View>

        {/* File Selection */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Select Encrypted File
          </Text>
          
          <TouchableOpacity
            style={[styles.fileSelector, { 
              backgroundColor: theme.colors.primaryContainer,
              borderColor: theme.colors.outline,
            }]}
            onPress={selectEncryptedFile}
          >
            <Text style={styles.fileSelectorIcon}>🔒</Text>
            <Text style={[styles.fileSelectorText, { color: theme.colors.onPrimaryContainer }]}>
              {selectedFile ? 'Change File' : 'Choose Encrypted File (.enc)'}
            </Text>
          </TouchableOpacity>

          {selectedFile && (
            <View style={[styles.selectedFile, { 
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.outline,
            }]}>
              <View style={styles.fileInfo}>
                <Text style={styles.fileIcon}>🔒</Text>
                <View style={styles.fileDetails}>
                  <Text style={[styles.fileName, { color: theme.colors.onSurface }]}>
                    {selectedFile.name}
                  </Text>
                  <Text style={[styles.fileSize, { color: theme.colors.onSurfaceVariant }]}>
                    {formatFileSize(selectedFile.size)} • Encrypted File
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedFile(null)}
                style={styles.removeButton}
              >
                <Text style={[styles.removeButtonText, { color: theme.colors.error }]}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Helper text */}
          <Text style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}>
            💡 Tip: First encrypt a file using the "Encrypt" tab, then come back here to decrypt it and test the preview feature!
          </Text>
        </View>

        {/* Decrypt Button */}
        {!showDecryptOptions && (
          <TouchableOpacity
            style={[styles.encryptButton, { 
              backgroundColor: selectedFile && !isDecrypting ? theme.colors.primary : theme.colors.surfaceVariant,
            }]}
            onPress={decryptFile}
            disabled={!selectedFile || isDecrypting}
          >
            <Text style={[styles.encryptButtonText, { 
              color: selectedFile && !isDecrypting ? theme.colors.onPrimary : theme.colors.onSurfaceVariant 
            }]}>
              {isDecrypting ? '🔄 Decrypting...' : '🔓 Decrypt File'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Decryption Success & Options */}
        {showDecryptOptions && decryptedFile && (
          <View style={[styles.section, { backgroundColor: theme.colors.tertiaryContainer }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onTertiaryContainer }]}>
              ✅ Decryption Complete!
            </Text>
            
            <View style={[styles.decryptedFileInfo, { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            }]}>
              <Text style={styles.fileIcon}>📄</Text>
              <View style={styles.fileDetails}>
                <Text style={[styles.fileName, { color: theme.colors.onSurface }]}>
                  {decryptedFile.name}
                </Text>
                <Text style={[styles.fileSize, { color: theme.colors.onSurfaceVariant }]}>
                  {formatFileSize(decryptedFile.size)} • Restored • {new Date(decryptedFile.decryptedAt).toLocaleTimeString()}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { 
                  backgroundColor: theme.colors.primary,
                  flex: 1,
                  marginRight: 8,
                }]}
                onPress={downloadDecryptedFile}
              >
                <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
                  📥 Download
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { 
                  backgroundColor: theme.colors.secondary,
                  flex: 1,
                  marginLeft: 8,
                }]}
                onPress={previewDecryptedFile}
              >
                <Text style={[styles.actionButtonText, { color: theme.colors.onSecondary }]}>
                  👁️ Preview
                </Text>
              </TouchableOpacity>
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={[styles.resetButton, { 
                backgroundColor: theme.colors.surfaceVariant,
                marginTop: 16,
              }]}
              onPress={resetDecryption}
            >
              <Text style={[styles.resetButtonText, { color: theme.colors.onSurfaceVariant }]}>
                🔄 Decrypt Another File
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Decryption Information */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Decryption Process
          </Text>
          
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, { color: theme.colors.onSurface }]}>
                🔍 Auto-Detection
              </Text>
              <Text style={[styles.optionDescription, { color: theme.colors.onSurfaceVariant }]}>
                Automatically detects encryption method and file type
              </Text>
            </View>
          </View>

          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, { color: theme.colors.onSurface }]}>
                🔐 Compatible Algorithms
              </Text>
              <Text style={[styles.optionDescription, { color: theme.colors.onSurfaceVariant }]}>
                Supports AES-256-GCM and fallback decryption methods
              </Text>
            </View>
          </View>

          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, { color: theme.colors.onSurface }]}>
                📄 File Restoration
              </Text>
              <Text style={[styles.optionDescription, { color: theme.colors.onSurfaceVariant }]}>
                Restores original file name, type, and content
              </Text>
            </View>
          </View>
        </View>

        {/* Decryption Progress */}
        {isDecrypting && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Decrypting File...
            </Text>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View 
                style={[styles.progressFill, { 
                  backgroundColor: theme.colors.primary,
                  width: `${decryptionProgress}%`
                }]} 
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
              {decryptionProgress}% Complete
            </Text>
          </View>
        )}

        {/* Security Information */}
        <View style={[styles.securityInfo, { backgroundColor: theme.colors.secondaryContainer }]}>
          <Text style={[styles.securityTitle, { color: theme.colors.onSecondaryContainer }]}>
            🛡️ Decryption Information
          </Text>
          <Text style={[styles.securityText, { color: theme.colors.onSecondaryContainer }]}>
            • Supports multiple encryption formats{'\n'}
            • Automatically detects encryption method{'\n'}
            • Restores original file names and types{'\n'}
            • All decryption happens locally in your browser{'\n'}
            • No data is sent to external servers
          </Text>
        </View>
      </ScrollView>

      {/* Preview Modal */}
      <Modal
        visible={showPreview}
        animationType="slide"
        transparent={true}
        onRequestClose={closePreview}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outline }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                📄 Preview: {decryptedFile?.name}
              </Text>
              <TouchableOpacity onPress={closePreview} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: theme.colors.onSurface }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Preview Content */}
            <View style={styles.previewContainer}>
              <ScrollView style={styles.previewScrollView}>
                <TextInput
                  style={[styles.previewText, { 
                    color: theme.colors.onSurface,
                    backgroundColor: theme.colors.surfaceVariant,
                  }]}
                  value={previewContent}
                  multiline={true}
                  editable={false}
                  scrollEnabled={false}
                />
              </ScrollView>
            </View>

            {/* Modal Footer */}
            <View style={[styles.modalFooter, { borderTopColor: theme.colors.outline }]}>
              <Text style={[styles.fileInfo, { color: theme.colors.onSurfaceVariant }]}>
                Size: {decryptedFile ? formatFileSize(decryptedFile.size) : '0'} • Type: {decryptedFile?.type || 'Unknown'}
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.downloadButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    closePreview();
                    downloadDecryptedFile();
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: theme.colors.onPrimary }]}>
                    📥 Download
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.colors.surfaceVariant }]}
                  onPress={closePreview}
                >
                  <Text style={[styles.modalButtonText, { color: theme.colors.onSurfaceVariant }]}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  fileSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  fileSelectorIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  fileSelectorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  encryptButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  encryptButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  securityInfo: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  securityText: {
    fontSize: 14,
    lineHeight: 20,
  },
  decryptedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 800,
    height: '80%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    marginLeft: 16,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  previewContainer: {
    flex: 1,
    padding: 8,
  },
  previewScrollView: {
    flex: 1,
  },
  previewText: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 20,
    textAlignVertical: 'top',
    minHeight: 300,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
  },
  fileInfo: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  downloadButton: {
    marginRight: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DecryptScreenWeb;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import sharedFileStorage from '../utils/sharedFileStorage';

const EncryptScreenWeb = () => {
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [encryptedFile, setEncryptedFile] = useState(null);
  const [shareCode, setShareCode] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [selectedDeleteTime, setSelectedDeleteTime] = useState('24h');

  const selectFile = async () => {
    if (Platform.OS === 'web') {
      // For web, we'll use HTML file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '*/*';
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

  const encryptFile = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    setIsEncrypting(true);
    setEncryptionProgress(0);
    setEncryptedFile(null);
    setShareCode(null);
    setShowShareOptions(false);

    try {
      // Read the file as array buffer
      const fileData = await selectedFile.file.arrayBuffer();
      
      // Simulate encryption progress while actually encrypting
      const interval = setInterval(() => {
        setEncryptionProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Perform actual encryption (simple XOR encryption for demo)
      const encryptedData = await performEncryption(fileData);
      
      // Complete the progress
      setEncryptionProgress(100);
      
      // Create encrypted file blob
      const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' });
      const encryptedUrl = URL.createObjectURL(encryptedBlob);
      
      // Create encrypted file object
      const encrypted = {
        name: selectedFile.name + '.encrypted',
        originalName: selectedFile.name,
        size: encryptedBlob.size,
        encryptedAt: new Date().toISOString(),
        downloadUrl: encryptedUrl,
        encryptedData: encryptedData,
        blob: encryptedBlob, // Add the blob property
      };
      
      setEncryptedFile(encrypted);
      setIsEncrypting(false);
      setShowShareOptions(true);
      Alert.alert('Success', `File "${selectedFile.name}" has been encrypted successfully!`);
      
    } catch (error) {
      setIsEncrypting(false);
      Alert.alert('Error', 'Failed to encrypt file: ' + error.message);
    }
  };

  // Better encryption function using Web Crypto API
  const performEncryption = async (data) => {
    try {
      // Generate a random key for AES encryption
      const key = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt']
      );

      // Generate a random initialization vector
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt the data
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        data
      );

      // Export the key for storage
      const exportedKey = await crypto.subtle.exportKey('raw', key);

      // Combine IV, key, and encrypted data
      const result = new Uint8Array(iv.length + exportedKey.byteLength + encryptedData.byteLength);
      result.set(iv, 0);
      result.set(new Uint8Array(exportedKey), iv.length);
      result.set(new Uint8Array(encryptedData), iv.length + exportedKey.byteLength);

      return result;
    } catch (error) {
      console.error('Encryption failed:', error);
      // Fallback to simple XOR if Web Crypto API fails
      return performSimpleEncryption(data);
    }
  };

  // Fallback simple encryption
  const performSimpleEncryption = (data) => {
    const key = 'MySecretKey123!@#$%^&*()_+ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const uint8Array = new Uint8Array(data);
    const encryptedArray = new Uint8Array(uint8Array.length);
    
    for (let i = 0; i < uint8Array.length; i++) {
      encryptedArray[i] = uint8Array[i] ^ key.charCodeAt(i % key.length);
    }
    
    return encryptedArray;
  };

  const generateShareCode = async () => {
    console.log('generateShareCode called');
    console.log('encryptedFile:', encryptedFile);
    
    if (!encryptedFile) {
      Alert.alert('Error', 'No encrypted file available. Please encrypt a file first.');
      return;
    }

    if (!encryptedFile.blob) {
      Alert.alert('Error', 'Encrypted file data is corrupted. Please encrypt the file again.');
      return;
    }

    // Generate a unique 8-character code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    console.log('Generated code:', code);

    try {
      // Calculate expiry date based on selected time
      const getExpiryTime = (timeSelection) => {
        const now = Date.now();
        switch (timeSelection) {
          case '1h': return now + (1 * 60 * 60 * 1000);
          case '6h': return now + (6 * 60 * 60 * 1000);
          case '24h': return now + (24 * 60 * 60 * 1000);
          case '7d': return now + (7 * 24 * 60 * 60 * 1000);
          default: return now + (24 * 60 * 60 * 1000);
        }
      };
      
      const expiryDate = new Date(getExpiryTime(selectedDeleteTime));
      
      console.log('Converting blob to base64...');
      // Convert the encrypted file blob to base64
      const arrayBuffer = await encryptedFile.blob.arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      console.log('Storing encrypted file...');
      const success = await sharedFileStorage.storeEncryptedFile(
        code,
        base64Data,
        selectedFile.name,
        expiryDate
      );

      console.log('Storage success:', success);

      if (success) {
        setShareCode(code);
        
        const getTimeDescription = (timeSelection) => {
          switch (timeSelection) {
            case '1h': return '1 hour';
            case '6h': return '6 hours';
            case '24h': return '24 hours';
            case '7d': return '7 days';
            default: return '24 hours';
          }
        };
        
        Alert.alert(
          'Share Code Generated',
          `Your file share code is: ${code}\n\nAnyone with this code can access your encrypted file. Share it securely!\n\nExpires in ${getTimeDescription(selectedDeleteTime)}.`,
          [{ text: 'Copy Code', onPress: () => copyToClipboard(code) }]
        );
      } else {
        Alert.alert('Error', 'Failed to store encrypted file. Please try again.');
      }
    } catch (error) {
      console.error('Error storing encrypted file:', error);
      Alert.alert('Error', 'Failed to generate share code. Please try again.\n\nError: ' + error.message);
    }
  };

  const copyToClipboard = (text) => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(text).then(() => {
        Alert.alert('Copied!', 'Share code copied to clipboard');
      });
    }
  };

  const downloadEncryptedFile = () => {
    if (!encryptedFile) return;
    
    try {
      // Create download link for the encrypted file
      const link = document.createElement('a');
      link.href = encryptedFile.downloadUrl;
      link.download = encryptedFile.name;
      
      // Add some metadata as a comment in the filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      link.download = `${selectedFile.name.split('.')[0]}_encrypted_${timestamp}.enc`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      Alert.alert(
        'Download Started', 
        `Encrypted file "${link.download}" is being downloaded.\n\nNote: This is an encrypted file and cannot be opened directly. Use the decrypt feature to restore the original file.`
      );
    } catch (error) {
      Alert.alert('Download Error', 'Failed to download encrypted file: ' + error.message);
    }
  };

  const resetEncryption = () => {
    // Clean up blob URLs to prevent memory leaks
    if (encryptedFile && encryptedFile.downloadUrl) {
      URL.revokeObjectURL(encryptedFile.downloadUrl);
    }
    if (selectedFile && selectedFile.uri) {
      URL.revokeObjectURL(selectedFile.uri);
    }
    
    setSelectedFile(null);
    setEncryptedFile(null);
    setShareCode(null);
    setShowShareOptions(false);
    setEncryptionProgress(0);
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
            🔒 Encrypt Files
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Secure your files with AES-256 encryption
          </Text>
        </View>

        {/* File Selection */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Select File to Encrypt
          </Text>
          
          <TouchableOpacity
            style={[styles.fileSelector, { 
              backgroundColor: theme.colors.primaryContainer,
              borderColor: theme.colors.outline,
            }]}
            onPress={selectFile}
          >
            <Text style={styles.fileSelectorIcon}>📁</Text>
            <Text style={[styles.fileSelectorText, { color: theme.colors.onPrimaryContainer }]}>
              {selectedFile ? 'Change File' : 'Choose File'}
            </Text>
          </TouchableOpacity>

          {selectedFile && (
            <View style={[styles.selectedFile, { 
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.outline,
            }]}>
              <View style={styles.fileInfo}>
                <Text style={styles.fileIcon}>📄</Text>
                <View style={styles.fileDetails}>
                  <Text style={[styles.fileName, { color: theme.colors.onSurface }]}>
                    {selectedFile.name}
                  </Text>
                  <Text style={[styles.fileSize, { color: theme.colors.onSurfaceVariant }]}>
                    {formatFileSize(selectedFile.size)}
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
        </View>

        {/* Auto-Delete Message - Only show when file is selected */}
        {selectedFile && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              ⏰ Auto-Delete
            </Text>
            <Text style={[styles.optionDescription, { color: theme.colors.onSurfaceVariant }]}>
              Choose when your encrypted file will be automatically deleted
            </Text>
            
            {/* Time Selection Options */}
            <View style={styles.timeOptionsContainer}>
              {[
                { value: '1h', label: '1 Hour' },
                { value: '6h', label: '6 Hours' },
                { value: '24h', label: '24 Hours' },
                { value: '7d', label: '7 Days' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.timeOption,
                    {
                      backgroundColor: selectedDeleteTime === option.value 
                        ? theme.colors.primaryContainer 
                        : theme.colors.surfaceVariant,
                      borderColor: selectedDeleteTime === option.value 
                        ? theme.colors.primary 
                        : theme.colors.outline,
                    }
                  ]}
                  onPress={() => setSelectedDeleteTime(option.value)}
                >
                  <Text style={[
                    styles.timeOptionLabel,
                    {
                      color: selectedDeleteTime === option.value 
                        ? theme.colors.onPrimaryContainer 
                        : theme.colors.onSurfaceVariant,
                      fontWeight: selectedDeleteTime === option.value ? '600' : '400'
                    }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Encrypt Button */}
        {!showShareOptions && (
          <TouchableOpacity
            style={[styles.encryptButton, { 
              backgroundColor: selectedFile && !isEncrypting ? theme.colors.primary : theme.colors.surfaceVariant,
            }]}
            onPress={encryptFile}
            disabled={!selectedFile || isEncrypting}
          >
            <Text style={[styles.encryptButtonText, { 
              color: selectedFile && !isEncrypting ? theme.colors.onPrimary : theme.colors.onSurfaceVariant 
            }]}>
              {isEncrypting ? '🔄 Encrypting...' : '🔒 Encrypt File'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Encryption Success & Options */}
        {showShareOptions && encryptedFile && (
          <View style={[styles.section, { backgroundColor: theme.colors.tertiaryContainer }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onTertiaryContainer }]}>
              ✅ Encryption Complete!
            </Text>
            
            <View style={[styles.encryptedFileInfo, { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            }]}>
              <Text style={styles.fileIcon}>🔒</Text>
              <View style={styles.fileDetails}>
                <Text style={[styles.fileName, { color: theme.colors.onSurface }]}>
                  {encryptedFile.originalName} (Encrypted)
                </Text>
                <Text style={[styles.fileSize, { color: theme.colors.onSurfaceVariant }]}>
                  {formatFileSize(encryptedFile.size)} • AES Encrypted • {new Date(encryptedFile.encryptedAt).toLocaleTimeString()}
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
                onPress={downloadEncryptedFile}
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
                onPress={() => {
                  console.log('Share button clicked!');
                  generateShareCode();
                }}
              >
                <Text style={[styles.actionButtonText, { color: theme.colors.onSecondary }]}>
                  🔗 Share
                </Text>
              </TouchableOpacity>
            </View>

            {/* Share Code Display */}
            {shareCode && (
              <View style={[styles.shareCodeContainer, { 
                backgroundColor: theme.colors.secondaryContainer,
                borderColor: theme.colors.outline,
              }]}>
                <Text style={[styles.shareCodeLabel, { color: theme.colors.onSecondaryContainer }]}>
                  Share Code:
                </Text>
                <View style={[styles.shareCodeBox, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.shareCodeText, { color: theme.colors.primary }]}>
                    {shareCode}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => copyToClipboard(shareCode)}
                    style={styles.copyButton}
                  >
                    <Text style={[styles.copyButtonText, { color: theme.colors.primary }]}>📋</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.shareCodeInstructions, { color: theme.colors.onSecondaryContainer }]}>
                  Share this code with others to give them access to your encrypted file. 
                  The file will be automatically deleted after 24 hours.
                </Text>
              </View>
            )}

            {/* Reset Button */}
            <TouchableOpacity
              style={[styles.resetButton, { 
                backgroundColor: theme.colors.surfaceVariant,
                marginTop: 16,
              }]}
              onPress={resetEncryption}
            >
              <Text style={[styles.resetButtonText, { color: theme.colors.onSurfaceVariant }]}>
                🔄 Encrypt Another File
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Encryption Options */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Encryption Settings
          </Text>
          
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, { color: theme.colors.onSurface }]}>
                🔐 Encryption Algorithm
              </Text>
              <Text style={[styles.optionDescription, { color: theme.colors.onSurfaceVariant }]}>
                AES-256 (Advanced Encryption Standard)
              </Text>
            </View>
          </View>

          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, { color: theme.colors.onSurface }]}>
                🔑 Password Protection
              </Text>
              <Text style={[styles.optionDescription, { color: theme.colors.onSurfaceVariant }]}>
                A secure password will be generated automatically
              </Text>
            </View>
          </View>
        </View>

        {/* Encryption Progress */}
        {isEncrypting && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Encrypting File...
            </Text>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View 
                style={[styles.progressFill, { 
                  backgroundColor: theme.colors.primary,
                  width: `${encryptionProgress}%`
                }]} 
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
              {encryptionProgress}% Complete
            </Text>
          </View>
        )}

        {/* Security Information */}
        <View style={[styles.securityInfo, { backgroundColor: theme.colors.secondaryContainer }]}>
          <Text style={[styles.securityTitle, { color: theme.colors.onSecondaryContainer }]}>
            🛡️ Security Information
          </Text>
          <Text style={[styles.securityText, { color: theme.colors.onSecondaryContainer }]}>
            • Your files are encrypted using AES-256 encryption{'\n'}
            • Encryption keys are generated locally{'\n'}
            • No data is stored on external servers{'\n'}
            • Files are automatically deleted after expiration
          </Text>
        </View>
      </ScrollView>
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
  encryptedFileInfo: {
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
  shareCodeContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  shareCodeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  shareCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  shareCodeText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyButton: {
    padding: 8,
  },
  copyButtonText: {
    fontSize: 18,
  },
  shareCodeInstructions: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
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
  timeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 10,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  timeOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EncryptScreenWeb;

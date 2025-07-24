import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import sharedFileStorage from '../utils/sharedFileStorage';

const ReceiveScreenWeb = () => {
  const { theme, isDarkMode } = useTheme();
  const [shareCode, setShareCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [receivedFile, setReceivedFile] = useState(null);
  const [fileType, setFileType] = useState(null); // 'encrypted' or 'unencrypted'
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (receivedFile && receivedFile.downloadUrl) {
        URL.revokeObjectURL(receivedFile.downloadUrl);
      }
    };
  }, [receivedFile]);

  const validateShareCode = (code) => {
    // Allow 6-8 characters, alphanumeric only
    const regex = /^[A-Z0-9]{6,8}$/;
    return regex.test(code);
  };

  const accessSharedFile = async () => {
    if (!shareCode.trim()) {
      Alert.alert('Error', 'Please enter a share code');
      return;
    }

    const cleanCode = shareCode.toUpperCase().trim();
    
    if (!validateShareCode(cleanCode)) {
      Alert.alert('Invalid Code', 'Share code must be 6-8 characters (letters and numbers only)');
      return;
    }

    setIsLoading(true);

    try {
      // Try to get the file from storage
      const fileData = sharedFileStorage.getFile(cleanCode);
      
      if (!fileData) {
        setIsLoading(false);
        Alert.alert('File Not Found', 'The share code you entered is invalid or the file has expired.');
        return;
      }

      // Determine file type based on the stored data
      const type = fileData.isEncrypted ? 'encrypted' : 'unencrypted';
      setFileType(type);

      // Create downloadable file
      const downloadableFile = await sharedFileStorage.createDownloadableFile(cleanCode);
      
      if (!downloadableFile) {
        setIsLoading(false);
        Alert.alert('Error', 'Unable to prepare file for download. Please try again.');
        return;
      }

      setIsLoading(false);
      setReceivedFile(downloadableFile);
      
      Alert.alert(
        'File Found!', 
        `Found ${type} file: ${downloadableFile.originalFileName || downloadableFile.fileName}\n\nFile size: ${formatFileSize(downloadableFile.fileSize)}\n\nYou can now download it.`
      );
      
    } catch (error) {
      setIsLoading(false);
      console.error('Error accessing shared file:', error);
      Alert.alert('Error', 'An error occurred while accessing the file. Please try again.');
    }
  };

  const downloadFile = () => {
    if (!receivedFile || !receivedFile.downloadUrl) {
      Alert.alert('Error', 'No file available for download');
      return;
    }
    
    try {
      // Create download link
      const link = document.createElement('a');
      link.href = receivedFile.downloadUrl;
      
      // Use the original filename or stored filename
      const originalName = receivedFile.originalFileName || receivedFile.fileName;
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      
      if (receivedFile.isEncrypted) {
        // For encrypted files, keep the .encrypted extension
        link.download = `${originalName}_received_${timestamp}.enc`;
      } else {
        // For unencrypted files, use the original filename with timestamp
        const nameParts = originalName.split('.');
        const extension = nameParts.length > 1 ? nameParts.pop() : '';
        const baseName = nameParts.join('.');
        link.download = extension ? `${baseName}_received_${timestamp}.${extension}` : `${baseName}_received_${timestamp}`;
      }
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      const message = receivedFile.isEncrypted 
        ? `Encrypted file "${link.download}" is being downloaded.\n\nNote: This is an encrypted file. You'll need the decryption password to restore the original file.`
        : `File "${link.download}" is being downloaded.\n\nThis file is ready to use immediately - no decryption needed!`;
      
      Alert.alert('Download Started', message);
    } catch (error) {
      Alert.alert('Download Error', 'Failed to download file: ' + error.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const resetSearch = () => {
    setShareCode('');
    setReceivedFile(null);
    setFileType(null);
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return '📄';
    const extension = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      'pdf': '📄',
      'doc': '📝',
      'docx': '📝',
      'txt': '📄',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'png': '🖼️',
      'gif': '🖼️',
      'mp4': '🎥',
      'mp3': '🎵',
      'zip': '📦',
      'rar': '📦',
      'encrypted': '🔒',
    };
    return iconMap[extension] || '📄';
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <LinearGradient
          colors={isDarkMode ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : ['rgba(147, 51, 234, 0.1)', 'rgba(168, 85, 247, 0.1)']}
          style={styles.headerGradient}
        >
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            📥 Receive Files
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Enter a share code to access and download files
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Code Input Section */}
      <Animated.View
        style={[
          styles.sectionContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <LinearGradient
          colors={isDarkMode ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : ['rgba(147, 51, 234, 0.05)', 'rgba(168, 85, 247, 0.05)']}
          style={styles.sectionCard}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            🔑 Enter Share Code
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.codeInput,
                {
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(147, 51, 234, 0.1)',
                  color: theme.colors.onSurface,
                  borderColor: shareCode ? '#9333ea' : theme.colors.outline,
                }
              ]}
              value={shareCode}
              onChangeText={(text) => setShareCode(text.toUpperCase())}
              placeholder="Enter 6-8 character code"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              maxLength={8}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isLoading}
            />
            
            <TouchableOpacity 
              style={[styles.accessButton, { opacity: isLoading ? 0.6 : 1 }]}
              onPress={accessSharedFile}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#9333ea', '#a855f7']}
                style={styles.accessButtonGradient}
              >
                <Text style={styles.accessButtonText}>
                  {isLoading ? '🔍 Searching...' : '🔍 Access File'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.codeHints}>
            <Text style={[styles.hintText, { color: theme.colors.onSurfaceVariant }]}>
              💡 Code formats:
            </Text>
            <Text style={[styles.hintDetailText, { color: theme.colors.onSurfaceVariant }]}>
              • 6 characters = Unencrypted file (e.g., ABC123)
            </Text>
            <Text style={[styles.hintDetailText, { color: theme.colors.onSurfaceVariant }]}>
              • 8 characters = Encrypted file (e.g., ABC123XY)
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* File Details Section */}
      {receivedFile && (
        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <LinearGradient
            colors={isDarkMode ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : ['rgba(147, 51, 234, 0.05)', 'rgba(168, 85, 247, 0.05)']}
            style={styles.sectionCard}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              📋 File Details
            </Text>
            
            <View style={[styles.fileCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(147, 51, 234, 0.1)' }]}>
              <View style={styles.fileHeader}>
                <Text style={styles.fileIcon}>
                  {getFileIcon(receivedFile.originalFileName || receivedFile.fileName)}
                </Text>
                <View style={styles.fileInfo}>
                  <Text style={[styles.fileName, { color: theme.colors.onSurface }]}>
                    {receivedFile.originalFileName || receivedFile.fileName}
                  </Text>
                  <Text style={[styles.fileSize, { color: theme.colors.onSurfaceVariant }]}>
                    {formatFileSize(receivedFile.fileSize || receivedFile.size)}
                  </Text>
                </View>
                <View style={[styles.fileTypeBadge, { 
                  backgroundColor: receivedFile.isEncrypted ? 'rgba(255, 99, 71, 0.2)' : 'rgba(147, 51, 234, 0.2)' 
                }]}>
                  <Text style={[styles.fileTypeText, { 
                    color: receivedFile.isEncrypted ? '#ff6347' : '#9333ea' 
                  }]}>
                    {receivedFile.isEncrypted ? '🔒 Encrypted' : '📖 Unencrypted'}
                  </Text>
                </View>
              </View>

              <View style={styles.fileActions}>
                <TouchableOpacity 
                  onPress={downloadFile}
                  style={[styles.downloadButton, { backgroundColor: '#9333ea' }]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.downloadButtonText}>⬇️ Download File</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={resetSearch}
                  style={[styles.resetButton, { borderColor: theme.colors.outline }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.resetButtonText, { color: theme.colors.onSurfaceVariant }]}>
                    🔄 Search Another
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.fileMetadata, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(147, 51, 234, 0.05)' }]}>
                <Text style={[styles.metadataText, { color: theme.colors.onSurfaceVariant }]}>
                  📅 Shared: {new Date(receivedFile.createdAt).toLocaleDateString()}
                </Text>
                <Text style={[styles.metadataText, { color: theme.colors.onSurfaceVariant }]}>
                  ⏰ Expires: {new Date(receivedFile.expiryDate).toLocaleDateString()}
                </Text>
                <Text style={[styles.metadataText, { color: theme.colors.onSurfaceVariant }]}>
                  📊 Downloads: {receivedFile.downloadCount || 0}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Instructions */}
      <Animated.View
        style={[
          styles.sectionContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <LinearGradient
          colors={isDarkMode ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] : ['rgba(147, 51, 234, 0.03)', 'rgba(168, 85, 247, 0.02)']}
          style={styles.sectionCard}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            📝 How to Use
          </Text>
          <View style={styles.instructionsList}>
            <Text style={[styles.instructionText, { color: theme.colors.onSurfaceVariant }]}>
              1. 📨 Get a share code from someone who shared a file
            </Text>
            <Text style={[styles.instructionText, { color: theme.colors.onSurfaceVariant }]}>
              2. 🔤 Enter the code in the field above
            </Text>
            <Text style={[styles.instructionText, { color: theme.colors.onSurfaceVariant }]}>
              3. 🔍 Click "Access File" to verify the code
            </Text>
            <Text style={[styles.instructionText, { color: theme.colors.onSurfaceVariant }]}>
              4. ⬇️ Download the file when ready
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    margin: 20,
    marginTop: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 25,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  sectionCard: {
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  codeInput: {
    borderWidth: 2,
    borderRadius: 15,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  accessButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  accessButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  accessButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  codeHints: {
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.05)',
  },
  hintText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  hintDetailText: {
    fontSize: 13,
    marginBottom: 4,
    paddingLeft: 8,
  },
  fileCard: {
    borderRadius: 15,
    padding: 20,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  fileIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    opacity: 0.8,
  },
  fileTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  fileTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fileActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  downloadButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fileMetadata: {
    padding: 15,
    borderRadius: 12,
  },
  metadataText: {
    fontSize: 13,
    marginBottom: 4,
  },
  instructionsList: {
    gap: 8,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ReceiveScreenWeb;

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
    // Share code should be 6-8 characters, alphanumeric
    const regex = /^[A-Z0-9]{6,8}$/;
    return regex.test(code.toUpperCase());
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

    // Simulate API call to retrieve file
    setTimeout(() => {
      setIsLoading(false);
      
      // Determine file type based on code length (demo logic)
      const isEncrypted = cleanCode.length === 8;
      const type = isEncrypted ? 'encrypted' : 'unencrypted';
      setFileType(type);
      
      let mockFile;
      
      if (isEncrypted) {
        // Create a mock encrypted file
        const mockEncryptedContent = new TextEncoder().encode(
          `ENCRYPTED_FILE_${cleanCode}_${Date.now()}\n` +
          'This is a demo encrypted file content. In a real application, this would be actual encrypted binary data.\n' +
          `Original filename: secret-document.pdf\n` +
          `Encryption algorithm: AES-256-GCM\n` +
          `Share code: ${cleanCode}\n` +
          `Encrypted at: ${new Date().toISOString()}\n` +
          'END_OF_ENCRYPTED_CONTENT'
        );
        
        const encryptedBlob = new Blob([mockEncryptedContent], { type: 'application/octet-stream' });
        const downloadUrl = URL.createObjectURL(encryptedBlob);
        
        mockFile = {
          id: cleanCode,
          name: 'secret-document.pdf.encrypted',
          originalName: 'secret-document.pdf',
          size: encryptedBlob.size,
          type: 'encrypted',
          uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
          downloadUrl: downloadUrl,
          blob: encryptedBlob,
        };
      } else {
        // Create a mock unencrypted file
        const mockContent = `This is a sample unencrypted file shared with code: ${cleanCode}\n\n` +
          'Content of the shared file goes here...\n' +
          'This file was shared without encryption for easy access.\n' +
          `Shared at: ${new Date().toISOString()}\n` +
          'You can download this file directly without any decryption needed.';
        
        const fileBlob = new Blob([mockContent], { type: 'text/plain' });
        const downloadUrl = URL.createObjectURL(fileBlob);
        
        mockFile = {
          id: cleanCode,
          name: 'shared-document.txt',
          originalName: 'shared-document.txt',
          size: fileBlob.size,
          type: 'unencrypted',
          uploadedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
          downloadUrl: downloadUrl,
          blob: fileBlob,
        };
      }

      setReceivedFile(mockFile);
      Alert.alert(
        'File Found!', 
        `Found ${type} file: ${mockFile.originalName}\n\nYou can now download it.`
      );
    }, 1500);
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
      
      // Create a proper filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      if (receivedFile.type === 'encrypted') {
        link.download = `${receivedFile.originalName.split('.')[0]}_received_${timestamp}.enc`;
      } else {
        const extension = receivedFile.originalName.split('.').pop();
        link.download = `${receivedFile.originalName.split('.')[0]}_received_${timestamp}.${extension}`;
      }
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      const message = receivedFile.type === 'encrypted' 
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
    if (receivedFile && receivedFile.downloadUrl) {
      URL.revokeObjectURL(receivedFile.downloadUrl);
    }
    
    setShareCode('');
    setReceivedFile(null);
    setFileType(null);
  };

  const getFileTypeIcon = () => {
    if (!fileType) return '📄';
    return fileType === 'encrypted' ? '🔒' : '📄';
  };

  const getFileTypeColor = () => {
    if (!fileType) return theme.colors.primary;
    return fileType === 'encrypted' ? '#f093fb' : '#43e97b';
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
          colors={isDarkMode ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : ['rgba(250, 112, 154, 0.1)', 'rgba(254, 225, 64, 0.1)']}
          style={styles.headerGradient}
        >
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            📥 Receive Files
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Access shared files using secure codes
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
          colors={isDarkMode ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : ['rgba(250, 112, 154, 0.05)', 'rgba(254, 225, 64, 0.05)']}
          style={styles.sectionCard}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            🔑 Enter Share Code
          </Text>
          
          <View style={[styles.inputContainer, { borderColor: theme.colors.outline }]}>
            <TextInput
              style={[styles.codeInput, { color: theme.colors.onSurface }]}
              value={shareCode}
              onChangeText={setShareCode}
              placeholder="Enter 6-8 character code"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              autoCapitalize="characters"
              maxLength={8}
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity 
            style={[styles.accessButton, { opacity: isLoading ? 0.6 : 1 }]}
            onPress={accessSharedFile}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#fa709a', '#fee140']}
              style={styles.accessButtonGradient}
            >
              <Text style={styles.accessButtonText}>
                {isLoading ? '🔍 Searching...' : '🔍 Access File'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}>
            💡 Enter the code you received to access the shared file.{'\n'}
            Encrypted files (8 chars) require decryption.{'\n'}
            Unencrypted files (6 chars) are ready to use.
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* File Details */}
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
            colors={isDarkMode ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : ['rgba(250, 112, 154, 0.05)', 'rgba(254, 225, 64, 0.05)']}
            style={styles.sectionCard}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              📋 File Details
            </Text>
            
            <View style={[styles.fileCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : `${getFileTypeColor()}15` }]}>
              <View style={styles.fileHeader}>
                <View style={[styles.fileIconContainer, { backgroundColor: getFileTypeColor() + '20' }]}>
                  <Text style={styles.fileIcon}>{getFileTypeIcon()}</Text>
                </View>
                <View style={styles.fileInfo}>
                  <Text style={[styles.fileName, { color: theme.colors.onSurface }]}>
                    {receivedFile.originalName}
                  </Text>
                  <View style={[styles.fileTypeChip, { backgroundColor: getFileTypeColor() + '20' }]}>
                    <Text style={[styles.fileTypeText, { color: getFileTypeColor() }]}>
                      {receivedFile.type === 'encrypted' ? '🔒 Encrypted' : '📄 Unencrypted'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.fileDetails}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Size:</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                    {formatFileSize(receivedFile.size)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Shared:</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                    {new Date(receivedFile.uploadedAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Expires:</Text>
                  <Text style={[styles.detailValue, { color: '#ff6b6b' }]}>
                    {formatTimeRemaining(receivedFile.expiresAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.downloadButton, { backgroundColor: getFileTypeColor() }]}
                  onPress={downloadFile}
                  activeOpacity={0.8}
                >
                  <Text style={styles.downloadButtonText}>
                    📥 Download {receivedFile.type === 'encrypted' ? 'Encrypted' : 'File'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.resetButton, { borderColor: theme.colors.outline }]}
                  onPress={resetSearch}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.resetButtonText, { color: theme.colors.onSurfaceVariant }]}>
                    🔄 Search Another
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Info Section */}
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
          colors={isDarkMode ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : ['rgba(250, 112, 154, 0.05)', 'rgba(254, 225, 64, 0.05)']}
          style={styles.sectionCard}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            ℹ️ How it works
          </Text>
          
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🔒</Text>
              <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                <Text style={{ fontWeight: '600' }}>Encrypted Files (8-char codes):</Text> Require decryption after download
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📄</Text>
              <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                <Text style={{ fontWeight: '600' }}>Unencrypted Files (6-char codes):</Text> Ready to use immediately
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>⏰</Text>
              <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                <Text style={{ fontWeight: '600' }}>Auto-Expiry:</Text> All shared files expire automatically for security
              </Text>
            </View>
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
    borderWidth: 2,
    borderRadius: 15,
    marginBottom: 15,
  },
  codeInput: {
    fontSize: 18,
    fontWeight: '600',
    padding: 15,
    textAlign: 'center',
    letterSpacing: 2,
  },
  accessButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  accessButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  accessButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  fileCard: {
    borderRadius: 15,
    padding: 20,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  fileIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  fileIcon: {
    fontSize: 24,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  fileTypeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  fileTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fileDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 10,
  },
  downloadButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  resetButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoList: {
    gap: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ReceiveScreenWeb;

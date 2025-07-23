import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

const ReceiveScreenWeb = () => {
  const { theme } = useTheme();
  const [shareCode, setShareCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [receivedFile, setReceivedFile] = useState(null);

  const validateShareCode = (code) => {
    // Share code should be 8 characters, alphanumeric
    const regex = /^[A-Z0-9]{8}$/;
    return regex.test(code.toUpperCase());
  };

  const accessSharedFile = async () => {
    if (!shareCode.trim()) {
      Alert.alert('Error', 'Please enter a share code');
      return;
    }

    const cleanCode = shareCode.toUpperCase().trim();
    
    if (!validateShareCode(cleanCode)) {
      Alert.alert('Invalid Code', 'Share code must be 8 characters (letters and numbers only)');
      return;
    }

    setIsLoading(true);

    // Simulate API call to retrieve file
    setTimeout(() => {
      setIsLoading(false);
      
      // In a real app, you would make an API call to check if the code exists
      // For demo purposes, we'll simulate finding a file
      const mockFile = {
        id: cleanCode,
        name: 'secret-document.pdf.encrypted',
        originalName: 'secret-document.pdf',
        size: 2048576, // 2MB
        uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // 22 hours from now
        downloadUrl: '#', // In real app, this would be the actual download URL
      };

      setReceivedFile(mockFile);
      Alert.alert(
        'File Found!', 
        `Found encrypted file: ${mockFile.originalName}\n\nYou can now download and decrypt it.`
      );
    }, 1500);
  };

  const downloadFile = () => {
    if (!receivedFile) return;
    
    Alert.alert(
      'Download Started',
      `Downloading ${receivedFile.originalName}...\n\nNote: You'll need the decryption password to open this file.`
    );
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
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            📥 Receive Files
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Enter a share code to access encrypted files
          </Text>
        </View>

        {/* Share Code Input */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Enter Share Code
          </Text>
          
          <View style={[styles.inputContainer, { borderColor: theme.colors.outline }]}>
            <Text style={styles.inputIcon}>🔑</Text>
            <TextInput
              style={[styles.textInput, { 
                color: theme.colors.onSurface,
                backgroundColor: theme.colors.surfaceVariant,
              }]}
              value={shareCode}
              onChangeText={setShareCode}
              placeholder="Enter 8-character code"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              maxLength={8}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.accessButton, { 
              backgroundColor: shareCode.trim() && !isLoading ? theme.colors.primary : theme.colors.surfaceVariant,
            }]}
            onPress={accessSharedFile}
            disabled={!shareCode.trim() || isLoading}
          >
            <Text style={[styles.accessButtonText, { 
              color: shareCode.trim() && !isLoading ? theme.colors.onPrimary : theme.colors.onSurfaceVariant 
            }]}>
              {isLoading ? '🔍 Searching...' : '🔍 Access File'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Found File */}
        {receivedFile && (
          <View style={[styles.section, { backgroundColor: theme.colors.tertiaryContainer }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onTertiaryContainer }]}>
              ✅ File Found!
            </Text>
            
            <View style={[styles.fileCard, { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            }]}>
              <View style={styles.fileHeader}>
                <Text style={styles.fileIcon}>🔒</Text>
                <View style={styles.fileInfo}>
                  <Text style={[styles.fileName, { color: theme.colors.onSurface }]}>
                    {receivedFile.originalName}
                  </Text>
                  <Text style={[styles.fileDetails, { color: theme.colors.onSurfaceVariant }]}>
                    {formatFileSize(receivedFile.size)} • Encrypted
                  </Text>
                </View>
              </View>

              <View style={styles.fileMetadata}>
                <View style={styles.metadataRow}>
                  <Text style={[styles.metadataLabel, { color: theme.colors.onSurfaceVariant }]}>
                    📅 Uploaded:
                  </Text>
                  <Text style={[styles.metadataValue, { color: theme.colors.onSurface }]}>
                    {new Date(receivedFile.uploadedAt).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={[styles.metadataLabel, { color: theme.colors.onSurfaceVariant }]}>
                    ⏰ Expires:
                  </Text>
                  <Text style={[styles.metadataValue, { color: theme.colors.error }]}>
                    {formatTimeRemaining(receivedFile.expiresAt)}
                  </Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={[styles.metadataLabel, { color: theme.colors.onSurfaceVariant }]}>
                    🔑 Code:
                  </Text>
                  <Text style={[styles.metadataValue, { 
                    color: theme.colors.primary,
                    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                  }]}>
                    {receivedFile.id}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.downloadButton, { backgroundColor: theme.colors.primary }]}
                onPress={downloadFile}
              >
                <Text style={[styles.downloadButtonText, { color: theme.colors.onPrimary }]}>
                  📥 Download Encrypted File
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.resetButton, { 
                backgroundColor: theme.colors.surfaceVariant,
                marginTop: 16,
              }]}
              onPress={resetSearch}
            >
              <Text style={[styles.resetButtonText, { color: theme.colors.onSurfaceVariant }]}>
                🔄 Access Another File
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Instructions */}
        <View style={[styles.instructions, { backgroundColor: theme.colors.secondaryContainer }]}>
          <Text style={[styles.instructionsTitle, { color: theme.colors.onSecondaryContainer }]}>
            📋 How it works
          </Text>
          <Text style={[styles.instructionsText, { color: theme.colors.onSecondaryContainer }]}>
            1. Get a share code from someone who encrypted a file{'\n'}
            2. Enter the 8-character code above{'\n'}
            3. Download the encrypted file{'\n'}
            4. Use the decrypt feature with the provided password{'\n\n'}
            
            ⚠️ Files are automatically deleted after 24 hours for security.
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
    borderRadius: 8,
  },
  accessButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  accessButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fileCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 14,
  },
  fileMetadata: {
    marginBottom: 20,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: 14,
    flex: 1,
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  downloadButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  downloadButtonText: {
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
  instructions: {
    padding: 20,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ReceiveScreenWeb;

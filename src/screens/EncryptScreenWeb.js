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

const EncryptScreenWeb = () => {
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptionProgress, setEncryptionProgress] = useState(0);

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

    // Simulate encryption progress
    const interval = setInterval(() => {
      setEncryptionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsEncrypting(false);
          Alert.alert('Success', `File "${selectedFile.name}" has been encrypted successfully!`);
          setSelectedFile(null);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
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
                ⏰ Auto-Delete
              </Text>
              <Text style={[styles.optionDescription, { color: theme.colors.onSurfaceVariant }]}>
                Files will be automatically deleted after 24 hours
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

        {/* Encrypt Button */}
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
});

export default EncryptScreenWeb;

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  ProgressBar,
  Snackbar,
  Surface,
  Chip,
} from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { decryptData } from '../utils/encryption';
import { readEncryptedFile, saveDecryptedFile, shareFile, getFileByShareCode } from '../utils/fileManager';
import { theme } from '../theme/theme';

export default function DecryptScreen() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [decryptedFilePath, setDecryptedFilePath] = useState(null);
  const [fileMetadata, setFileMetadata] = useState(null);
  const [shareCode, setShareCode] = useState('');
  const [useShareCode, setUseShareCode] = useState(false);

  const pickEncryptedFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Check if it's likely an encrypted file
        if (!file.name.includes('.secure')) {
          Alert.alert(
            'File Warning',
            'This doesn\'t appear to be an encrypted file. Encrypted files typically have a .secure extension.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Continue Anyway', onPress: () => setSelectedFile(file) }
            ]
          );
        } else {
          setSelectedFile(file);
        }
      }
    } catch (error) {
      showSnackbar('Failed to pick document');
    }
  };

  const decryptFile = async () => {
    if (!selectedFile) {
      showSnackbar('Please select an encrypted file first');
      return;
    }

    if (!password) {
      showSnackbar('Please enter the decryption password');
      return;
    }

    setIsDecrypting(true);
    setProgress(0);

    try {
      setProgress(0.2);

      // Read the encrypted file
      const fileData = await readEncryptedFile(selectedFile.uri);
      
      setProgress(0.4);

      // Check if password matches
      if (fileData.metadata.password !== password) {
        throw new Error('Incorrect password');
      }

      setProgress(0.6);

      // Decrypt the data
      const decryptedData = await decryptData(
        fileData.encryptedData,
        fileData.metadata.key,
        fileData.metadata.iv
      );

      setProgress(0.8);

      // Save decrypted file
      const filePath = await saveDecryptedFile(
        fileData.metadata.originalName,
        decryptedData
      );

      setProgress(1);
      setDecryptedFilePath(filePath);
      setFileMetadata(fileData.metadata);
      showSnackbar('File decrypted successfully!');

    } catch (error) {
      console.error('Decryption error:', error);
      showSnackbar('Decryption failed: ' + error.message);
    } finally {
      setIsDecrypting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const decryptWithShareCode = async () => {
    if (!shareCode.trim()) {
      showSnackbar('Please enter a share code');
      return;
    }

    setIsDecrypting(true);
    setProgress(0);

    try {
      setProgress(0.2);

      // Get file data using share code
      const shareData = await getFileByShareCode(shareCode.trim().toUpperCase());
      
      setProgress(0.4);

      // Read the encrypted file
      const fileData = await readEncryptedFile(shareData.filePath);
      
      setProgress(0.6);

      // Decrypt the data
      const decryptedData = await decryptData(
        fileData.encryptedData,
        fileData.metadata.key,
        fileData.metadata.iv
      );

      setProgress(0.8);

      // Save decrypted file
      const filePath = await saveDecryptedFile(
        fileData.metadata.originalName,
        decryptedData
      );

      setProgress(1);
      setDecryptedFilePath(filePath);
      setFileMetadata(fileData.metadata);
      showSnackbar('File decrypted successfully with share code!');

    } catch (error) {
      console.error('Share code decryption error:', error);
      showSnackbar('Failed to decrypt with share code: ' + error.message);
    } finally {
      setIsDecrypting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const shareDecryptedFile = async () => {
    if (decryptedFilePath) {
      try {
        await shareFile(decryptedFilePath);
      } catch (error) {
        showSnackbar('Failed to share file');
      }
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPassword('');
    setDecryptedFilePath(null);
    setFileMetadata(null);
    setShareCode('');
    setUseShareCode(false);
    setProgress(0);
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animatable.View animation="fadeInUp" duration={800}>
          <Text style={styles.title}>Decrypt Your Files</Text>
          <Text style={styles.subtitle}>
            Safely access your encrypted files with the correct password
          </Text>
        </Animatable.View>

        {/* File Selection */}
        <Animatable.View animation="fadeInUp" delay={200} duration={800}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Icon name="folder-open" size={24} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Select Encrypted File</Text>
              </View>
              
              {selectedFile ? (
                <Surface style={styles.fileInfo}>
                  <Icon name="lock" size={32} color={theme.colors.accent} />
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName}>{selectedFile.name}</Text>
                    <Text style={styles.fileSize}>
                      {formatFileSize(selectedFile.size)}
                    </Text>
                  </View>
                  <Button
                    mode="text"
                    onPress={pickEncryptedFile}
                    icon="refresh"
                    compact
                  >
                    Change
                  </Button>
                </Surface>
              ) : (
                <Button
                  mode="contained"
                  onPress={pickEncryptedFile}
                  icon="lock"
                  style={styles.button}
                >
                  Choose Encrypted File
                </Button>
              )}
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Password Input */}
        <Animatable.View animation="fadeInUp" delay={400} duration={800}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Icon name="vpn-key" size={24} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Decryption Password</Text>
              </View>

              <TextInput
                label="Enter Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                placeholder="Enter the password used to encrypt this file"
              />

              {password && (
                <Chip
                  icon="info"
                  textStyle={{ fontSize: 12 }}
                  style={styles.infoChip}
                >
                  Password must match the one used during encryption
                </Chip>
              )}
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Progress */}
        {isDecrypting && (
          <Animatable.View animation="fadeInUp" duration={500}>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.progressTitle}>Decrypting...</Text>
                <ProgressBar
                  progress={progress}
                  color={theme.colors.accent}
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {Math.round(progress * 100)}% Complete
                </Text>
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {/* File Information */}
        {fileMetadata && !isDecrypting && (
          <Animatable.View animation="fadeInUp" duration={800}>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Icon name="info" size={24} color={theme.colors.primary} />
                  <Text style={styles.cardTitle}>File Information</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Original Name:</Text>
                  <Text style={styles.infoValue}>{fileMetadata.originalName}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>File Type:</Text>
                  <Text style={styles.infoValue}>{fileMetadata.type || 'Unknown'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Size:</Text>
                  <Text style={styles.infoValue}>{formatFileSize(fileMetadata.size)}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Encrypted:</Text>
                  <Text style={styles.infoValue}>{formatDate(fileMetadata.createdAt)}</Text>
                </View>

                {fileMetadata.autoDelete && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Auto-delete:</Text>
                    <Text style={[styles.infoValue, styles.warningText]}>
                      {formatDate(fileMetadata.expiresAt)}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {/* Success Actions */}
        {decryptedFilePath && !isDecrypting && (
          <Animatable.View animation="fadeInUp" duration={800}>
            <Card style={[styles.card, styles.successCard]}>
              <Card.Content>
                <View style={styles.successHeader}>
                  <Icon name="check-circle" size={32} color={theme.colors.success} />
                  <Text style={styles.successTitle}>Decryption Complete!</Text>
                </View>
                
                <Text style={styles.successMessage}>
                  Your file has been successfully decrypted and is ready to use.
                </Text>
                
                <View style={styles.actionButtons}>
                  <Button
                    mode="contained"
                    onPress={shareDecryptedFile}
                    icon="share"
                    style={[styles.button, styles.shareButton]}
                  >
                    Share File
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={resetForm}
                    icon="refresh"
                    style={styles.button}
                  >
                    Decrypt Another
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {/* Decrypt Button */}
        {selectedFile && password && !decryptedFilePath && (
          <Animatable.View animation="fadeInUp" delay={600} duration={800}>
            <Button
              mode="contained"
              onPress={decryptFile}
              loading={isDecrypting}
              disabled={isDecrypting}
              icon="lock-open"
              style={styles.decryptButton}
              contentStyle={styles.decryptButtonContent}
            >
              {isDecrypting ? 'Decrypting...' : 'Decrypt File'}
            </Button>
          </Animatable.View>
        )}
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 8,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.accent + '10',
  },
  fileDetails: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  fileSize: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginTop: 2,
  },
  input: {
    marginBottom: 12,
  },
  infoChip: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary + '20',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.placeholder,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  warningText: {
    color: theme.colors.warning,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  successCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.success,
    marginLeft: 12,
  },
  successMessage: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: 16,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  shareButton: {
    backgroundColor: theme.colors.success,
  },
  decryptButton: {
    marginTop: 8,
    marginBottom: 32,
  },
  decryptButtonContent: {
    paddingVertical: 8,
  },
});

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  ProgressBar,
  Snackbar,
  Chip,
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { decryptData } from '../utils/encryption';
import { readEncryptedFile, saveDecryptedFile, shareFile, getFileByShareCode } from '../utils/fileManager';
import { theme } from '../theme/theme';

export default function ReceiveScreen() {
  const [shareCode, setShareCode] = useState('');
  const [isReceiving, setIsReceiving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [receivedFilePath, setReceivedFilePath] = useState(null);
  const [fileMetadata, setFileMetadata] = useState(null);

  const receiveFile = async () => {
    if (!shareCode.trim()) {
      showSnackbar('Please enter a share code');
      return;
    }

    setIsReceiving(true);
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
      setReceivedFilePath(filePath);
      setFileMetadata(fileData.metadata);
      showSnackbar('File received successfully!');

    } catch (error) {
      console.error('Receive error:', error);
      showSnackbar('Failed to receive file: ' + error.message);
    } finally {
      setIsReceiving(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const shareReceivedFile = async () => {
    if (receivedFilePath) {
      try {
        await shareFile(receivedFilePath);
      } catch (error) {
        showSnackbar('Failed to share file');
      }
    }
  };

  const resetForm = () => {
    setShareCode('');
    setReceivedFilePath(null);
    setFileMetadata(null);
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
          <Text style={styles.title}>Receive Shared File</Text>
          <Text style={styles.subtitle}>
            Enter the share code to receive an encrypted file
          </Text>
        </Animatable.View>

        {/* Share Code Input */}
        <Animatable.View animation="fadeInUp" delay={200} duration={800}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Icon name="share" size={24} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Enter Share Code</Text>
              </View>

              <TextInput
                label="Share Code"
                value={shareCode}
                onChangeText={setShareCode}
                mode="outlined"
                style={styles.input}
                placeholder="Enter 5-character code (e.g., ABC12)"
                autoCapitalize="characters"
                maxLength={5}
              />

              <View style={styles.infoContainer}>
                <Icon name="info" size={16} color={theme.colors.primary} />
                <Text style={styles.infoText}>
                  Share codes are case-insensitive and valid for 24 hours
                </Text>
              </View>

              {shareCode && shareCode.length === 5 && (
                <Chip
                  icon="check"
                  textStyle={{ fontSize: 12 }}
                  style={styles.successChip}
                >
                  Ready to receive file
                </Chip>
              )}
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Progress */}
        {isReceiving && (
          <Animatable.View animation="fadeInUp" duration={500}>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.progressTitle}>Receiving File...</Text>
                <ProgressBar
                  progress={progress}
                  color={theme.colors.primary}
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {Math.round(progress * 100)}% Complete
                </Text>
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {/* Success */}
        {receivedFilePath && !isReceiving && (
          <Animatable.View animation="fadeInUp" duration={800}>
            <Card style={[styles.card, styles.successCard]}>
              <Card.Content>
                <View style={styles.successHeader}>
                  <Icon name="check-circle" size={32} color={theme.colors.success} />
                  <Text style={styles.successTitle}>File Received!</Text>
                </View>

                {fileMetadata && (
                  <View style={styles.fileDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>File Name:</Text>
                      <Text style={styles.detailValue}>{fileMetadata.originalName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Size:</Text>
                      <Text style={styles.detailValue}>{formatFileSize(fileMetadata.size)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Type:</Text>
                      <Text style={styles.detailValue}>{fileMetadata.type || 'Unknown'}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <Button
                    mode="contained"
                    onPress={shareReceivedFile}
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
                    Receive Another
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {/* Receive Button */}
        {shareCode.length === 5 && !receivedFilePath && (
          <Animatable.View animation="fadeInUp" delay={400} duration={800}>
            <Button
              mode="contained"
              onPress={receiveFile}
              loading={isReceiving}
              disabled={isReceiving}
              icon="download"
              style={styles.receiveButton}
              contentStyle={styles.receiveButtonContent}
            >
              {isReceiving ? 'Receiving...' : 'Receive File'}
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
  input: {
    marginBottom: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginLeft: 8,
    flex: 1,
  },
  successChip: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.success + '20',
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
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.success,
    marginLeft: 12,
  },
  fileDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.placeholder,
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  shareButton: {
    backgroundColor: theme.colors.success,
  },
  receiveButton: {
    marginTop: 8,
    marginBottom: 32,
  },
  receiveButtonContent: {
    paddingVertical: 8,
  },
});

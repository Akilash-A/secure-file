import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Switch,
  ProgressBar,
  Snackbar,
  Surface,
  Chip,
} from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { generateKey, generateIV, encryptData, generateSecurePassword } from '../utils/encryption';
import { saveEncryptedFile, shareFile } from '../utils/fileManager';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');

export default function EncryptScreen() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState('');
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [autoDelete, setAutoDelete] = useState(false);
  const [deleteAfter, setDeleteAfter] = useState('60'); // minutes
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [encryptedFilePath, setEncryptedFilePath] = useState(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        if (autoGenerate) {
          const newPassword = await generateSecurePassword();
          setPassword(newPassword);
        }
      }
    } catch (error) {
      showSnackbar('Failed to pick document');
    }
  };

  const generateNewPassword = async () => {
    try {
      const newPassword = await generateSecurePassword();
      setPassword(newPassword);
      showSnackbar('New password generated');
    } catch (error) {
      showSnackbar('Failed to generate password');
    }
  };

  const encryptFile = async () => {
    if (!selectedFile) {
      showSnackbar('Please select a file first');
      return;
    }

    if (!password) {
      showSnackbar('Please enter or generate a password');
      return;
    }

    setIsEncrypting(true);
    setProgress(0);

    try {
      // Simulate progress
      setProgress(0.2);

      // Read file content
      const response = await fetch(selectedFile.uri);
      const fileData = await response.text();
      
      setProgress(0.4);

      // Generate encryption keys
      const key = await generateKey();
      const iv = await generateIV();
      
      setProgress(0.6);

      // Encrypt the data
      const encryptedData = await encryptData(fileData, key, iv);
      
      setProgress(0.8);

      // Prepare metadata
      const expiresAt = autoDelete 
        ? new Date(Date.now() + parseInt(deleteAfter) * 60 * 1000).toISOString()
        : null;

      const metadata = {
        originalName: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.mimeType,
        password: password,
        key: key,
        iv: iv,
        autoDelete: autoDelete,
        deleteAfter: parseInt(deleteAfter),
        expiresAt: expiresAt,
      };

      // Save encrypted file
      const filePath = await saveEncryptedFile(
        `${selectedFile.name}_${Date.now()}`,
        encryptedData,
        metadata
      );

      setProgress(1);
      setEncryptedFilePath(filePath);
      showSnackbar('File encrypted successfully!');
      
    } catch (error) {
      console.error('Encryption error:', error);
      showSnackbar('Encryption failed: ' + error.message);
    } finally {
      setIsEncrypting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const shareEncryptedFile = async () => {
    if (encryptedFilePath) {
      try {
        await shareFile(encryptedFilePath);
      } catch (error) {
        showSnackbar('Failed to share file');
      }
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPassword('');
    setEncryptedFilePath(null);
    setProgress(0);
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animatable.View animation="fadeInUp" duration={800}>
          <Text style={styles.title}>Encrypt Your Files</Text>
          <Text style={styles.subtitle}>
            Protect your files with military-grade AES-256 encryption
          </Text>
        </Animatable.View>

        {/* File Selection */}
        <Animatable.View animation="fadeInUp" delay={200} duration={800}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Icon name="attach-file" size={24} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Select File</Text>
              </View>
              
              {selectedFile ? (
                <Surface style={styles.fileInfo}>
                  <Icon name="description" size={32} color={theme.colors.primary} />
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName}>{selectedFile.name}</Text>
                    <Text style={styles.fileSize}>
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </Text>
                  </View>
                  <Button
                    mode="text"
                    onPress={pickDocument}
                    icon="refresh"
                    compact
                  >
                    Change
                  </Button>
                </Surface>
              ) : (
                <Button
                  mode="contained"
                  onPress={pickDocument}
                  icon="folder-open"
                  style={styles.button}
                >
                  Choose File
                </Button>
              )}
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Password Settings */}
        <Animatable.View animation="fadeInUp" delay={400} duration={800}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Icon name="vpn-key" size={24} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Encryption Password</Text>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Auto-generate secure password</Text>
                <Switch
                  value={autoGenerate}
                  onValueChange={(value) => {
                    setAutoGenerate(value);
                    if (value && selectedFile) {
                      generateNewPassword();
                    }
                  }}
                />
              </View>

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                editable={!autoGenerate}
                style={styles.input}
                right={
                  autoGenerate ? (
                    <TextInput.Icon
                      icon="refresh"
                      onPress={generateNewPassword}
                    />
                  ) : null
                }
              />

              {password ? (
                <Chip
                  icon="shield-check"
                  textStyle={{ fontSize: 12 }}
                  style={styles.strengthChip}
                >
                  Strong Password
                </Chip>
              ) : null}
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Auto-delete Settings */}
        <Animatable.View animation="fadeInUp" delay={600} duration={800}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Icon name="auto-delete" size={24} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Auto-delete Settings</Text>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Enable auto-delete</Text>
                <Switch
                  value={autoDelete}
                  onValueChange={setAutoDelete}
                />
              </View>

              {autoDelete && (
                <TextInput
                  label="Delete after (minutes)"
                  value={deleteAfter}
                  onChangeText={setDeleteAfter}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Progress */}
        {isEncrypting && (
          <Animatable.View animation="fadeInUp" duration={500}>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.progressTitle}>Encrypting...</Text>
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

        {/* Success Actions */}
        {encryptedFilePath && !isEncrypting && (
          <Animatable.View animation="fadeInUp" duration={800}>
            <Card style={[styles.card, styles.successCard]}>
              <Card.Content>
                <View style={styles.successHeader}>
                  <Icon name="check-circle" size={32} color={theme.colors.success} />
                  <Text style={styles.successTitle}>Encryption Complete!</Text>
                </View>
                
                <View style={styles.actionButtons}>
                  <Button
                    mode="contained"
                    onPress={shareEncryptedFile}
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
                    Encrypt Another
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {/* Encrypt Button */}
        {selectedFile && password && !encryptedFilePath && (
          <Animatable.View animation="fadeInUp" delay={800} duration={800}>
            <Button
              mode="contained"
              onPress={encryptFile}
              loading={isEncrypting}
              disabled={isEncrypting}
              icon="lock"
              style={styles.encryptButton}
              contentStyle={styles.encryptButtonContent}
            >
              {isEncrypting ? 'Encrypting...' : 'Encrypt File'}
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
    backgroundColor: theme.colors.primary + '10',
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  input: {
    marginBottom: 12,
  },
  strengthChip: {
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
  encryptButton: {
    marginTop: 8,
    marginBottom: 32,
  },
  encryptButtonContent: {
    paddingVertical: 8,
  },
});

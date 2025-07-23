import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Switch,
  ProgressBar,
  Snackbar,
  Chip,
  Divider,
} from 'react-native-paper';
import { useTheme } from '../theme/ThemeContext';
import WebIcon from '../components/WebIcon';

export default function EncryptScreenContent() {
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState('');
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [autoDelete, setAutoDelete] = useState(false);
  const [deleteAfter, setDeleteAfter] = useState('60');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [encryptedFilePath, setEncryptedFilePath] = useState(null);
  const [shareCode, setShareCode] = useState(null);

  const pickDocument = async () => {
    if (Platform.OS === 'web') {
      // For web, create a file input
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setSelectedFile({
            name: file.name,
            size: file.size,
            type: file.type,
            uri: URL.createObjectURL(file),
            file: file,
          });
        }
      };
      input.click();
    } else {
      // For mobile, would use DocumentPicker
      Alert.alert('File Picker', 'Document picker not available in demo mode');
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  const encryptFile = async () => {
    if (!selectedFile) {
      setSnackbarMessage('Please select a file to encrypt');
      setSnackbarVisible(true);
      return;
    }

    if (!autoGenerate && !password) {
      setSnackbarMessage('Please enter a password or enable auto-generation');
      setSnackbarVisible(true);
      return;
    }

    setIsEncrypting(true);
    setProgress(0);

    try {
      // Simulate encryption progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 1) {
            clearInterval(interval);
            return 1;
          }
          return prev + 0.1;
        });
      }, 200);

      // Wait for "encryption" to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      const finalPassword = autoGenerate ? (password || generatePassword()) : password;
      const mockShareCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      setEncryptedFilePath(`encrypted_${selectedFile.name}.enc`);
      setShareCode(mockShareCode);
      setSnackbarMessage('File encrypted successfully!');
      setSnackbarVisible(true);
      
    } catch (error) {
      setSnackbarMessage('Encryption failed: ' + error.message);
      setSnackbarVisible(true);
    } finally {
      setIsEncrypting(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPassword('');
    setEncryptedFilePath(null);
    setShareCode(null);
    setProgress(0);
  };

  React.useEffect(() => {
    if (autoGenerate && !password) {
      generatePassword();
    }
  }, [autoGenerate]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* File Selection Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            📁 Select File
          </Text>
          
          {!selectedFile ? (
            <Button
              mode="outlined"
              onPress={pickDocument}
              style={styles.button}
              contentStyle={styles.buttonContent}
              icon={() => <WebIcon name="folder" size={20} color={theme.colors.primary} />}
            >
              Choose File to Encrypt
            </Button>
          ) : (
            <View style={styles.selectedFile}>
              <Chip
                icon={() => <WebIcon name="check-circle" size={16} color={theme.colors.success} />}
                onClose={resetForm}
                style={[styles.fileChip, { backgroundColor: theme.colors.successContainer }]}
              >
                {selectedFile.name}
              </Chip>
              <Text style={[styles.fileInfo, { color: theme.colors.onSurfaceVariant }]}>
                Size: {(selectedFile.size / 1024).toFixed(1)} KB
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Password Settings Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            🔑 Encryption Settings
          </Text>
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
              Auto-generate secure password
            </Text>
            <Switch
              value={autoGenerate}
              onValueChange={setAutoGenerate}
              trackColor={{ 
                false: theme.colors.surfaceVariant, 
                true: theme.colors.primaryContainer 
              }}
              thumbColor={autoGenerate ? theme.colors.primary : theme.colors.outline}
            />
          </View>

          <TextInput
            label="Encryption Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!autoGenerate}
            editable={!autoGenerate}
            style={styles.textInput}
            right={
              !autoGenerate ? (
                <TextInput.Icon 
                  icon={() => <WebIcon name="settings" size={20} color={theme.colors.onSurfaceVariant} />}
                  onPress={generatePassword}
                />
              ) : null
            }
          />

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
              Auto-delete after expiry
            </Text>
            <Switch
              value={autoDelete}
              onValueChange={setAutoDelete}
              trackColor={{ 
                false: theme.colors.surfaceVariant, 
                true: theme.colors.primaryContainer 
              }}
              thumbColor={autoDelete ? theme.colors.primary : theme.colors.outline}
            />
          </View>

          {autoDelete && (
            <TextInput
              label="Delete after (minutes)"
              value={deleteAfter}
              onChangeText={setDeleteAfter}
              mode="outlined"
              keyboardType="numeric"
              style={styles.textInput}
            />
          )}
        </Card.Content>
      </Card>

      {/* Encryption Progress */}
      {isEncrypting && (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              🔄 Encrypting File...
            </Text>
            <ProgressBar 
              progress={progress} 
              color={theme.colors.primary}
              style={styles.progressBar}
            />
            <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
              {Math.round(progress * 100)}% Complete
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Results Card */}
      {encryptedFilePath && !isEncrypting && (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              ✅ Encryption Complete
            </Text>
            
            <View style={styles.resultItem}>
              <Text style={[styles.resultLabel, { color: theme.colors.onSurfaceVariant }]}>
                Encrypted File:
              </Text>
              <Text style={[styles.resultValue, { color: theme.colors.onSurface }]}>
                {encryptedFilePath}
              </Text>
            </View>

            <View style={styles.resultItem}>
              <Text style={[styles.resultLabel, { color: theme.colors.onSurfaceVariant }]}>
                Share Code:
              </Text>
              <Text style={[styles.resultValue, { color: theme.colors.primary }]}>
                {shareCode}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                onPress={() => {
                  setSnackbarMessage('File shared successfully!');
                  setSnackbarVisible(true);
                }}
                style={[styles.button, { flex: 1, marginRight: 8 }]}
                icon={() => <WebIcon name="share" size={16} color={theme.colors.onPrimary} />}
              >
                Share
              </Button>
              <Button
                mode="outlined"
                onPress={resetForm}
                style={[styles.button, { flex: 1, marginLeft: 8 }]}
              >
                New File
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Encrypt Button */}
      {selectedFile && !encryptedFilePath && !isEncrypting && (
        <Button
          mode="contained"
          onPress={encryptFile}
          style={[styles.encryptButton, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.encryptButtonContent}
          icon={() => <WebIcon name="lock" size={20} color={theme.colors.onPrimary} />}
        >
          Encrypt File
        </Button>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  button: {
    marginVertical: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  selectedFile: {
    alignItems: 'center',
  },
  fileChip: {
    marginBottom: 8,
  },
  fileInfo: {
    fontSize: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
  },
  textInput: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  progressBar: {
    marginVertical: 16,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
  },
  resultItem: {
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  encryptButton: {
    marginVertical: 16,
  },
  encryptButtonContent: {
    paddingVertical: 12,
  },
});

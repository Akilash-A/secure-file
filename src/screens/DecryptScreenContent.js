import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  ProgressBar,
  Snackbar,
  Chip,
} from 'react-native-paper';
import { useTheme } from '../theme/ThemeContext';
import WebIcon from '../components/WebIcon';

export default function DecryptScreenContent() {
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [decryptedFilePath, setDecryptedFilePath] = useState(null);

  const pickDocument = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.enc';
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
      setSnackbarMessage('File picker not available in demo mode');
      setSnackbarVisible(true);
    }
  };

  const decryptFile = async () => {
    if (!selectedFile) {
      setSnackbarMessage('Please select an encrypted file');
      setSnackbarVisible(true);
      return;
    }

    if (!password && !shareCode) {
      setSnackbarMessage('Please enter password or share code');
      setSnackbarVisible(true);
      return;
    }

    setIsDecrypting(true);
    setProgress(0);

    try {
      // Simulate decryption progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 1) {
            clearInterval(interval);
            return 1;
          }
          return prev + 0.1;
        });
      }, 200);

      // Wait for "decryption" to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      const originalName = selectedFile.name.replace('.enc', '');
      setDecryptedFilePath(`decrypted_${originalName}`);
      setSnackbarMessage('File decrypted successfully!');
      setSnackbarVisible(true);
      
    } catch (error) {
      setSnackbarMessage('Decryption failed: ' + error.message);
      setSnackbarVisible(true);
    } finally {
      setIsDecrypting(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPassword('');
    setShareCode('');
    setDecryptedFilePath(null);
    setProgress(0);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* File Selection Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            📁 Select Encrypted File
          </Text>
          
          {!selectedFile ? (
            <Button
              mode="outlined"
              onPress={pickDocument}
              style={styles.button}
              contentStyle={styles.buttonContent}
              icon={() => <WebIcon name="folder" size={20} color={theme.colors.primary} />}
            >
              Choose Encrypted File (.enc)
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

      {/* Decryption Credentials Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            🔑 Decryption Credentials
          </Text>
          
          <Text style={[styles.instruction, { color: theme.colors.onSurfaceVariant }]}>
            Enter either the encryption password or the share code to decrypt the file.
          </Text>

          <TextInput
            label="Encryption Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.textInput}
            left={<TextInput.Icon icon={() => <WebIcon name="lock" size={20} color={theme.colors.onSurfaceVariant} />} />}
          />

          <Text style={[styles.orText, { color: theme.colors.onSurfaceVariant }]}>
            - OR -
          </Text>

          <TextInput
            label="Share Code"
            value={shareCode}
            onChangeText={(text) => setShareCode(text.toUpperCase())}
            mode="outlined"
            style={styles.textInput}
            left={<TextInput.Icon icon={() => <WebIcon name="share" size={20} color={theme.colors.onSurfaceVariant} />} />}
            placeholder="Enter 6-character code"
            maxLength={6}
          />
        </Card.Content>
      </Card>

      {/* Decryption Progress */}
      {isDecrypting && (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              🔓 Decrypting File...
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
      {decryptedFilePath && !isDecrypting && (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              ✅ Decryption Complete
            </Text>
            
            <View style={styles.resultItem}>
              <Text style={[styles.resultLabel, { color: theme.colors.onSurfaceVariant }]}>
                Decrypted File:
              </Text>
              <Text style={[styles.resultValue, { color: theme.colors.onSurface }]}>
                {decryptedFilePath}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                onPress={() => {
                  setSnackbarMessage('File downloaded successfully!');
                  setSnackbarVisible(true);
                }}
                style={[styles.button, { flex: 1, marginRight: 8 }]}
                icon={() => <WebIcon name="download" size={16} color={theme.colors.onPrimary} />}
              >
                Download
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

      {/* Decrypt Button */}
      {selectedFile && !decryptedFilePath && !isDecrypting && (
        <Button
          mode="contained"
          onPress={decryptFile}
          style={[styles.decryptButton, { backgroundColor: theme.colors.secondary }]}
          contentStyle={styles.decryptButtonContent}
          icon={() => <WebIcon name="lock-open" size={20} color={theme.colors.onPrimary} />}
          disabled={!password && !shareCode}
        >
          Decrypt File
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
  instruction: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
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
  textInput: {
    marginBottom: 16,
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    marginVertical: 8,
    fontWeight: '500',
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
  decryptButton: {
    marginVertical: 16,
  },
  decryptButtonContent: {
    paddingVertical: 12,
  },
});

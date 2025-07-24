import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Animated, TouchableOpacity, Platform, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function ShareScreenWeb() {
  const { theme, isDarkMode } = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [shareCode, setShareCode] = useState('');
  const [expiryTime, setExpiryTime] = useState('24h');
  const [sharedFiles, setSharedFiles] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentShareCode, setCurrentShareCode] = useState('');
  
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

  const expiryOptions = [
    { label: '1 Hour', value: '1h', hours: 1 },
    { label: '24 Hours', value: '24h', hours: 24 },
    { label: '7 Days', value: '7d', hours: 168 },
    { label: '30 Days', value: '30d', hours: 720 },
  ];

  const generateShareCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleFileSelect = async () => {
    try {
      if (Platform.OS === 'web') {
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
              file: file
            });
          }
        };
        input.click();
      }
    } catch (error) {
      console.error('Error selecting file:', error);
    }
  };

  const handleShare = async () => {
    if (!selectedFile) return;

    const code = generateShareCode();
    const expiryHours = expiryOptions.find(opt => opt.value === expiryTime)?.hours || 24;
    const expiryDate = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    let blobUrl = '';
    if (selectedFile.file) {
      blobUrl = URL.createObjectURL(selectedFile.file);
    }

    const sharedFile = {
      id: Date.now(),
      code: code,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
      blobUrl: blobUrl,
      expiryDate: expiryDate,
      createdAt: new Date(),
      downloadCount: 0,
    };

    setSharedFiles([...sharedFiles, sharedFile]);
    setShareCode(code);
    setCurrentShareCode(code);
    setShowSuccessModal(true);

    console.log('File shared with code:', code);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
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
    };
    return iconMap[extension] || '📄';
  };

  const resetForm = () => {
    setSelectedFile(null);
    setShareCode('');
    setShowSuccessModal(false);
    setCurrentShareCode('');
  };

  const copyToClipboard = (text) => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(text);
      alert('Code copied to clipboard!');
    }
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
          colors={isDarkMode ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : ['rgba(67, 233, 123, 0.1)', 'rgba(56, 249, 215, 0.1)']}
          style={styles.headerGradient}
        >
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            📤 Share Files
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Share files instantly without encryption using secure codes
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* File Selection */}
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
          colors={isDarkMode ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : ['rgba(67, 233, 123, 0.05)', 'rgba(56, 249, 215, 0.05)']}
          style={styles.sectionCard}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Select File to Share
          </Text>
          
          {!selectedFile ? (
            <TouchableOpacity 
              style={[styles.fileSelectButton, { borderColor: theme.colors.primary }]}
              onPress={handleFileSelect}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#43e97b', '#38f9d7']}
                style={styles.fileSelectGradient}
              >
                <Text style={styles.fileSelectIcon}>📁</Text>
                <Text style={styles.fileSelectText}>Choose File</Text>
                <Text style={styles.fileSelectSubtext}>Click to browse your files</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={[styles.selectedFileCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(67, 233, 123, 0.1)' }]}>
              <View style={styles.fileInfo}>
                <Text style={styles.fileIcon}>{getFileIcon(selectedFile.name)}</Text>
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
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Expiry Settings */}
      {selectedFile && (
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
            colors={isDarkMode ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : ['rgba(67, 233, 123, 0.05)', 'rgba(56, 249, 215, 0.05)']}
            style={styles.sectionCard}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              ⏰ Set Expiry Time
            </Text>
            <View style={styles.expiryOptions}>
              {expiryOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setExpiryTime(option.value)}
                  style={[
                    styles.expiryChip,
                    {
                      backgroundColor: expiryTime === option.value 
                        ? (isDarkMode ? 'rgba(67, 233, 123, 0.3)' : 'rgba(67, 233, 123, 0.2)')
                        : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                      borderColor: expiryTime === option.value ? '#43e97b' : 'transparent',
                    }
                  ]}
                >
                  <Text style={[
                    styles.expiryChipText,
                    { 
                      color: expiryTime === option.value 
                        ? '#43e97b' 
                        : theme.colors.onSurfaceVariant 
                    }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Share Button */}
      {selectedFile && !showSuccessModal && (
        <Animated.View
          style={[
            styles.actionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#43e97b', '#38f9d7']}
              style={styles.shareButtonGradient}
            >
              <Text style={styles.shareButtonText}>🚀 Share File</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <Animated.View
          style={[
            styles.successModalContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <LinearGradient
            colors={isDarkMode ? ['rgba(67, 233, 123, 0.2)', 'rgba(56, 249, 215, 0.1)'] : ['rgba(67, 233, 123, 0.1)', 'rgba(56, 249, 215, 0.05)']}
            style={styles.successModal}
          >
            <View style={styles.successHeader}>
              <Text style={styles.successIcon}>🎉</Text>
              <Text style={[styles.successTitle, { color: theme.colors.onSurface }]}>
                File Shared Successfully!
              </Text>
              <Text style={[styles.successSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Your file is now available for download
              </Text>
            </View>

            <View style={[styles.codeContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(67, 233, 123, 0.1)' }]}>
              <Text style={[styles.codeLabel, { color: theme.colors.onSurfaceVariant }]}>
                Share Code
              </Text>
              <Text style={[styles.codeText, { color: '#43e97b' }]}>
                {currentShareCode}
              </Text>
              <TouchableOpacity 
                onPress={() => copyToClipboard(currentShareCode)}
                style={[styles.copyCodeButton, { backgroundColor: '#43e97b' }]}
                activeOpacity={0.8}
              >
                <Text style={styles.copyCodeButtonText}>📋 Copy Code</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.successActions}>
              <TouchableOpacity 
                onPress={resetForm}
                style={[styles.shareAnotherButton, { borderColor: theme.colors.primary }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.shareAnotherButtonText, { color: theme.colors.primary }]}>
                  📤 Share Another File
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.instructionsContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(67, 233, 123, 0.05)' }]}>
              <Text style={[styles.instructionsTitle, { color: theme.colors.onSurface }]}>
                📝 Instructions:
              </Text>
              <Text style={[styles.instructionsText, { color: theme.colors.onSurfaceVariant }]}>
                • Share this code with anyone you want to give access to the file{'\n'}
                • They can download the file using the "Receive" tab{'\n'}
                • The file will expire based on your selected time setting{'\n'}
                • No encryption - files are shared directly for easy access
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Shared Files List */}
      {sharedFiles.length > 0 && (
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
            colors={isDarkMode ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : ['rgba(67, 233, 123, 0.05)', 'rgba(56, 249, 215, 0.05)']}
            style={styles.sectionCard}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              📋 Shared Files
            </Text>
            {sharedFiles.map((file) => (
              <View key={file.id} style={[styles.sharedFileCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(67, 233, 123, 0.1)' }]}>
                <View style={styles.sharedFileInfo}>
                  <Text style={styles.fileIcon}>{getFileIcon(file.fileName)}</Text>
                  <View style={styles.sharedFileDetails}>
                    <Text style={[styles.sharedFileName, { color: theme.colors.onSurface }]}>
                      {file.fileName}
                    </Text>
                    <Text style={[styles.sharedFileCode, { color: '#43e97b' }]}>
                      Code: {file.code}
                    </Text>
                    <Text style={[styles.sharedFileExpiry, { color: theme.colors.onSurfaceVariant }]}>
                      Expires: {file.expiryDate.toLocaleDateString()} {file.expiryDate.toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => {
                    if (Platform.OS === 'web') {
                      navigator.clipboard.writeText(file.code);
                      alert('Code copied to clipboard!');
                    }
                  }}
                  style={[styles.copyButton, { backgroundColor: '#43e97b' }]}
                >
                  <Text style={styles.copyButtonText}>📋</Text>
                </TouchableOpacity>
              </View>
            ))}
          </LinearGradient>
        </Animated.View>
      )}
    </ScrollView>
  );
}

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
  fileSelectButton: {
    borderRadius: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  fileSelectGradient: {
    padding: 30,
    alignItems: 'center',
  },
  fileSelectIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  fileSelectText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  fileSelectSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  selectedFileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIcon: {
    fontSize: 32,
    marginRight: 15,
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
    opacity: 0.8,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expiryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  expiryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  expiryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  shareButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  shareButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  sharedFileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  sharedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sharedFileDetails: {
    flex: 1,
  },
  sharedFileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sharedFileCode: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  sharedFileExpiry: {
    fontSize: 12,
    opacity: 0.8,
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButtonText: {
    fontSize: 16,
  },
  successModalContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  successModal: {
    borderRadius: 20,
    padding: 25,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  codeContainer: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeText: {
    fontSize: 36,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 4,
    marginBottom: 15,
  },
  copyCodeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  copyCodeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  successActions: {
    marginBottom: 20,
  },
  shareAnotherButton: {
    borderWidth: 2,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  shareAnotherButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  instructionsContainer: {
    padding: 20,
    borderRadius: 15,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
});

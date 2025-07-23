import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  List,
  Divider,
  Snackbar,
} from 'react-native-paper';
import { useTheme } from '../theme/ThemeContext';
import WebIcon from '../components/WebIcon';

export default function HistoryScreenContent() {
  const { theme } = useTheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Mock data for demo
  const [fileHistory] = useState([
    {
      id: '1',
      name: 'document.pdf',
      type: 'encrypt',
      date: '2025-07-23T15:30:00Z',
      size: 2048,
      status: 'completed',
      shareCode: 'ABC123',
      expiresAt: '2025-07-24T15:30:00Z',
    },
    {
      id: '2',
      name: 'image.jpg',
      type: 'decrypt',
      date: '2025-07-23T14:15:00Z',
      size: 1536,
      status: 'completed',
      shareCode: null,
      expiresAt: null,
    },
    {
      id: '3',
      name: 'data.xlsx',
      type: 'encrypt',
      date: '2025-07-23T12:45:00Z',
      size: 4096,
      status: 'expired',
      shareCode: 'XYZ789',
      expiresAt: '2025-07-23T13:45:00Z',
    },
  ]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatSize = (bytes) => {
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'expired':
        return theme.colors.error;
      case 'pending':
        return theme.colors.warning;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'expired':
        return 'error';
      case 'pending':
        return 'access-time';
      default:
        return 'info';
    }
  };

  const handleShare = (item) => {
    if (item.shareCode) {
      setSnackbarMessage(`Share code: ${item.shareCode}`);
      setSnackbarVisible(true);
    }
  };

  const handleDelete = (item) => {
    setSnackbarMessage(`${item.name} deleted from history`);
    setSnackbarVisible(true);
  };

  const clearHistory = () => {
    setSnackbarMessage('All history cleared');
    setSnackbarVisible(true);
  };

  if (fileHistory.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.emptyContent}>
            <WebIcon name="history" size={64} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
              No History Yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              Your file encryption and decryption history will appear here.
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
              📜 File History
            </Text>
            <Button
              mode="outlined"
              onPress={clearHistory}
              compact
              icon={() => <WebIcon name="delete" size={16} color={theme.colors.error} />}
            >
              Clear
            </Button>
          </View>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            {fileHistory.length} file{fileHistory.length !== 1 ? 's' : ''} processed
          </Text>
        </Card.Content>
      </Card>

      {/* History List */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.listContainer}>
          {fileHistory.map((item, index) => (
            <View key={item.id}>
              <View style={styles.historyItem}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemTitleRow}>
                    <WebIcon 
                      name={item.type === 'encrypt' ? 'lock' : 'lock-open'} 
                      size={20} 
                      color={item.type === 'encrypt' ? theme.colors.primary : theme.colors.secondary}
                    />
                    <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}>
                      {item.name}
                    </Text>
                  </View>
                  <Chip
                    icon={() => (
                      <WebIcon 
                        name={getStatusIcon(item.status)} 
                        size={12} 
                        color={getStatusColor(item.status)} 
                      />
                    )}
                    style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
                    textStyle={{ color: getStatusColor(item.status), fontSize: 10 }}
                    compact
                  >
                    {item.status}
                  </Chip>
                </View>

                <View style={styles.itemDetails}>
                  <Text style={[styles.itemDetail, { color: theme.colors.onSurfaceVariant }]}>
                    {item.type === 'encrypt' ? '🔒 Encrypted' : '🔓 Decrypted'} • {formatSize(item.size)}
                  </Text>
                  <Text style={[styles.itemDetail, { color: theme.colors.onSurfaceVariant }]}>
                    {formatDate(item.date)}
                  </Text>
                  {item.expiresAt && (
                    <Text style={[styles.itemDetail, { color: theme.colors.warning }]}>
                      Expires: {formatDate(item.expiresAt)}
                    </Text>
                  )}
                </View>

                <View style={styles.itemActions}>
                  {item.shareCode && item.status === 'completed' && (
                    <Button
                      mode="outlined"
                      onPress={() => handleShare(item)}
                      compact
                      style={styles.actionButton}
                      icon={() => <WebIcon name="share" size={14} color={theme.colors.primary} />}
                    >
                      Share
                    </Button>
                  )}
                  <Button
                    mode="text"
                    onPress={() => handleDelete(item)}
                    compact
                    style={styles.actionButton}
                    textColor={theme.colors.error}
                    icon={() => <WebIcon name="delete" size={14} color={theme.colors.error} />}
                  >
                    Delete
                  </Button>
                </View>
              </View>
              {index < fileHistory.length - 1 && (
                <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
              )}
            </View>
          ))}
        </Card.Content>
      </Card>

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
  emptyCard: {
    marginTop: 50,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 0,
  },
  historyItem: {
    paddingVertical: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  statusChip: {
    height: 24,
  },
  itemDetails: {
    marginBottom: 12,
    marginLeft: 28,
  },
  itemDetail: {
    fontSize: 12,
    marginBottom: 2,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    marginHorizontal: 4,
  },
  divider: {
    marginVertical: 8,
  },
});

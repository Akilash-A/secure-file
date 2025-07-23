import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  List,
  Chip,
  FAB,
  Portal,
  Modal,
  Searchbar,
  Menu,
  Divider,
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { 
  getFileHistory, 
  deleteFile, 
  removeFromHistory, 
  shareFile,
  cleanExpiredFiles 
} from '../utils/fileManager';
import { theme } from '../theme/theme';

export default function HistoryScreen() {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [menuVisible, setMenuVisible] = useState({});

  useFocusEffect(
    useCallback(() => {
      loadHistory();
      cleanExpiredFiles();
    }, [])
  );

  useEffect(() => {
    filterFiles();
  }, [files, searchQuery, selectedFilter]);

  const loadHistory = async () => {
    try {
      const history = await getFileHistory();
      setFiles(history);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cleanExpiredFiles();
    await loadHistory();
    setRefreshing(false);
  };

  const filterFiles = () => {
    let filtered = [...files];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(file =>
        file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    const currentTime = new Date().toISOString();
    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(file => 
          !file.expiresAt || file.expiresAt > currentTime
        );
        break;
      case 'expired':
        filtered = filtered.filter(file => 
          file.expiresAt && file.expiresAt <= currentTime
        );
        break;
      case 'auto-delete':
        filtered = filtered.filter(file => file.autoDelete);
        break;
      default: // 'all'
        break;
    }

    setFilteredFiles(filtered);
  };

  const handleDeleteFile = async (file) => {
    Alert.alert(
      'Delete File',
      `Are you sure you want to delete "${file.fileName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFile(file.filePath);
              await removeFromHistory(file.id);
              await loadHistory();
            } catch (error) {
              console.error('Failed to delete file:', error);
            }
          },
        },
      ]
    );
  };

  const handleShareFile = async (file) => {
    try {
      await shareFile(file.filePath);
    } catch (error) {
      console.error('Failed to share file:', error);
    }
  };

  const toggleMenu = (fileId) => {
    setMenuVisible(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getFileStatus = (file) => {
    const currentTime = new Date().toISOString();
    
    if (file.expiresAt && file.expiresAt <= currentTime) {
      return { label: 'Expired', color: theme.colors.error };
    } else if (file.autoDelete) {
      const timeLeft = new Date(file.expiresAt) - new Date();
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      
      if (hoursLeft < 1) {
        return { label: 'Expires soon', color: theme.colors.warning };
      } else {
        return { label: `${hoursLeft}h left`, color: theme.colors.success };
      }
    } else {
      return { label: 'Active', color: theme.colors.success };
    }
  };

  const getFilterOptions = () => [
    { label: 'All Files', value: 'all' },
    { label: 'Active Files', value: 'active' },
    { label: 'Expired Files', value: 'expired' },
    { label: 'Auto-delete Files', value: 'auto-delete' },
  ];

  const renderFileItem = (file, index) => {
    const status = getFileStatus(file);
    
    return (
      <Animatable.View
        key={file.id}
        animation="fadeInUp"
        delay={index * 100}
        duration={600}
      >
        <Card style={styles.fileCard}>
          <List.Item
            title={file.fileName}
            description={`Created: ${formatDate(file.createdAt)}`}
            left={(props) => (
              <View style={styles.fileIcon}>
                <Icon name="file-lock" size={24} color={theme.colors.primary} />
              </View>
            )}
            right={(props) => (
              <Menu
                visible={menuVisible[file.id]}
                onDismiss={() => toggleMenu(file.id)}
                anchor={
                  <Button
                    onPress={() => toggleMenu(file.id)}
                    icon="more-vert"
                    mode="text"
                    compact
                  />
                }
              >
                <Menu.Item
                  onPress={() => {
                    toggleMenu(file.id);
                    handleShareFile(file);
                  }}
                  title="Share"
                  leadingIcon="share"
                />
                <Divider />
                <Menu.Item
                  onPress={() => {
                    toggleMenu(file.id);
                    handleDeleteFile(file);
                  }}
                  title="Delete"
                  leadingIcon="delete"
                />
              </Menu>
            )}
          />
          
          <View style={styles.fileFooter}>
            <Chip
              textStyle={{ fontSize: 12 }}
              style={[styles.statusChip, { backgroundColor: status.color + '20' }]}
            >
              <Text style={{ color: status.color }}>{status.label}</Text>
            </Chip>
            
            {file.autoDelete && (
              <Chip
                icon="auto-delete"
                textStyle={{ fontSize: 12 }}
                style={styles.autoDeleteChip}
              >
                Auto-delete
              </Chip>
            )}
          </View>
        </Card>
      </Animatable.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search files..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <Button
          mode="outlined"
          onPress={() => setFilterModalVisible(true)}
          icon="filter-list"
          compact
          style={styles.filterButton}
        >
          Filter
        </Button>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredFiles.length === 0 ? (
          <Animatable.View animation="fadeInUp" duration={800}>
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Icon
                  name="folder-open"
                  size={64}
                  color={theme.colors.placeholder}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>No Files Found</Text>
                <Text style={styles.emptySubtitle}>
                  {files.length === 0
                    ? 'Start encrypting files to see them here'
                    : 'No files match your current filter'
                  }
                </Text>
              </Card.Content>
            </Card>
          </Animatable.View>
        ) : (
          <View>
            <Text style={styles.resultsText}>
              {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} found
            </Text>
            
            {filteredFiles.map((file, index) => renderFileItem(file, index))}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={filterModalVisible}
          onDismiss={() => setFilterModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Filter Files</Text>
          
          {getFilterOptions().map((option) => (
            <List.Item
              key={option.value}
              title={option.label}
              onPress={() => {
                setSelectedFilter(option.value);
                setFilterModalVisible(false);
              }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={selectedFilter === option.value ? 'radio-button-checked' : 'radio-button-unchecked'}
                  color={selectedFilter === option.value ? theme.colors.primary : theme.colors.placeholder}
                />
              )}
            />
          ))}
          
          <Button
            mode="text"
            onPress={() => setFilterModalVisible(false)}
            style={styles.modalCloseButton}
          >
            Close
          </Button>
        </Modal>

        <FAB
          style={styles.fab}
          icon="refresh"
          color="white"
          onPress={onRefresh}
        />
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  searchbar: {
    flex: 1,
    marginRight: 8,
  },
  filterButton: {
    borderColor: theme.colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsText: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: 12,
    textAlign: 'center',
  },
  fileCard: {
    marginBottom: 12,
    elevation: 2,
  },
  fileIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  fileFooter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    marginRight: 8,
  },
  autoDeleteChip: {
    backgroundColor: theme.colors.warning + '20',
  },
  emptyCard: {
    marginTop: 32,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: theme.colors.text,
  },
  modalCloseButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

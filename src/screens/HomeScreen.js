import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Surface,
  FAB,
  Portal,
  Modal,
  List,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getFileHistory, cleanExpiredFiles } from '../utils/fileManager';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [recentFiles, setRecentFiles] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState({
    totalFiles: 0,
    encryptedFiles: 0,
    activeFiles: 0,
  });

  useEffect(() => {
    loadData();
    
    // Clean expired files on app start
    cleanExpiredFiles();
    
    // Set up periodic cleanup (every 5 minutes)
    const interval = setInterval(cleanExpiredFiles, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const history = await getFileHistory();
      setRecentFiles(history.slice(0, 5)); // Show only 5 most recent
      
      const currentTime = new Date().toISOString();
      const activeFiles = history.filter(file => 
        !file.expiresAt || file.expiresAt > currentTime
      );
      
      setStats({
        totalFiles: history.length,
        encryptedFiles: history.length,
        activeFiles: activeFiles.length,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Animatable.View animation="fadeInUp" duration={800}>
      <Surface style={[styles.statCard, { borderLeftColor: color }]}>
        <View style={styles.statContent}>
          <View style={styles.statText}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
          </View>
          <Icon name={icon} size={32} color={color} />
        </View>
      </Surface>
    </Animatable.View>
  );

  const FeatureCard = ({ title, subtitle, icon, color, onPress }) => (
    <Animatable.View animation="fadeInUp" duration={800}>
      <Card style={styles.featureCard} onPress={onPress}>
        <Card.Content style={styles.featureContent}>
          <View style={[styles.featureIcon, { backgroundColor: color + '20' }]}>
            <Icon name={icon} size={28} color={color} />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureSubtitle}>{subtitle}</Text>
          </View>
        </Card.Content>
      </Card>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.accent]}
        style={styles.header}
      >
        <Animatable.View animation="fadeInDown" duration={1000}>
          <Text style={styles.headerTitle}>Secure File Transfer</Text>
          <Text style={styles.headerSubtitle}>
            Military-grade encryption for your files
          </Text>
        </Animatable.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsContainer}>
            <StatCard
              title="Total Files"
              value={stats.totalFiles}
              icon="folder"
              color={theme.colors.primary}
            />
            <StatCard
              title="Encrypted"
              value={stats.encryptedFiles}
              icon="lock"
              color={theme.colors.success}
            />
            <StatCard
              title="Active"
              value={stats.activeFiles}
              icon="access-time"
              color={theme.colors.warning}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <FeatureCard
            title="Encrypt Files"
            subtitle="Secure your files with AES-256 encryption"
            icon="lock"
            color={theme.colors.primary}
            onPress={() => navigation.navigate('Encrypt')}
          />
          <FeatureCard
            title="Decrypt Files"
            subtitle="Access your encrypted files safely"
            icon="lock-open"
            color={theme.colors.accent}
            onPress={() => navigation.navigate('Decrypt')}
          />
          <FeatureCard
            title="View History"
            subtitle="Manage and track your encrypted files"
            icon="history"
            color={theme.colors.success}
            onPress={() => navigation.navigate('History')}
          />
        </View>

        {/* Recent Files */}
        {recentFiles.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Files</Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('History')}
                labelStyle={{ color: theme.colors.primary }}
              >
                View All
              </Button>
            </View>
            {recentFiles.map((file, index) => (
              <Animatable.View
                key={file.id}
                animation="fadeInLeft"
                delay={index * 100}
                duration={600}
              >
                <List.Item
                  title={file.fileName}
                  description={`Created: ${new Date(file.createdAt).toLocaleDateString()}`}
                  left={(props) => <List.Icon {...props} icon="file-lock" />}
                  style={styles.listItem}
                />
              </Animatable.View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <Portal>
        <FAB
          style={styles.fab}
          icon="plus"
          color="white"
          onPress={() => setModalVisible(true)}
        />
        
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Quick Actions</Text>
          <Button
            mode="contained"
            icon="lock"
            onPress={() => {
              setModalVisible(false);
              navigation.navigate('Encrypt');
            }}
            style={styles.modalButton}
          >
            Encrypt File
          </Button>
          <Button
            mode="outlined"
            icon="lock-open"
            onPress={() => {
              setModalVisible(false);
              navigation.navigate('Decrypt');
            }}
            style={styles.modalButton}
          >
            Decrypt File
          </Button>
        </Modal>
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
    padding: 24,
    paddingTop: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statTitle: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginTop: 2,
  },
  featureCard: {
    marginBottom: 12,
    elevation: 2,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  featureSubtitle: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginTop: 2,
  },
  listItem: {
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: theme.colors.text,
  },
  modalButton: {
    marginBottom: 12,
  },
});

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useTheme } from '../theme/ThemeContext';
import WebIcon from '../components/WebIcon';

export default function HomeScreenContent() {
  const { theme } = useTheme();

  const features = [
    {
      title: 'Encrypt Files',
      description: 'Secure your files with AES-256 encryption',
      icon: 'lock',
      color: theme.colors.primary,
    },
    {
      title: 'Decrypt Files',
      description: 'Decrypt your secured files safely',
      icon: 'lock-open',
      color: theme.colors.secondary,
    },
    {
      title: 'Auto-Delete',
      description: 'Files automatically delete after expiry',
      icon: 'access-time',
      color: theme.colors.tertiary,
    },
    {
      title: 'Secure Sharing',
      description: 'Share files with generated secure codes',
      icon: 'share',
      color: theme.colors.success,
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.welcomeCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.welcomeTitle, { color: theme.colors.onSurface }]}>
            🔐 Welcome to Secure File Transfer
          </Text>
          <Text style={[styles.welcomeText, { color: theme.colors.onSurfaceVariant }]}>
            Encrypt, decrypt, and securely share your files with military-grade AES-256 encryption.
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.featuresGrid}>
        {features.map((feature, index) => (
          <Card key={index} style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.featureContent}>
              <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                <WebIcon name={feature.icon} size={28} color={feature.color} />
              </View>
              <Text style={[styles.featureTitle, { color: theme.colors.onSurface }]}>
                {feature.title}
              </Text>
              <Text style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                {feature.description}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Card style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.statsTitle, { color: theme.colors.onSurface }]}>
            Quick Stats
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>256</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Bit Encryption
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.secondary }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Files Encrypted
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.tertiary }]}>100%</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Secure
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 20,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  featureCard: {
    width: '48%',
    marginBottom: 12,
    elevation: 1,
  },
  featureContent: {
    alignItems: 'center',
    padding: 16,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  statsCard: {
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, ProgressBar, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme/theme';

export const LoadingCard = ({ title, progress, subtitle }) => (
  <Card style={styles.card}>
    <Card.Content style={styles.content}>
      <View style={styles.header}>
        <Icon name="hourglass-empty" size={24} color={theme.colors.primary} />
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <ProgressBar
        progress={progress}
        color={theme.colors.primary}
        style={styles.progressBar}
      />
      
      <Text style={styles.subtitle}>
        {subtitle || `${Math.round(progress * 100)}% Complete`}
      </Text>
    </Card.Content>
  </Card>
);

export const ErrorCard = ({ title, message, onRetry }) => (
  <Card style={[styles.card, styles.errorCard]}>
    <Card.Content style={styles.content}>
      <View style={styles.header}>
        <Icon name="error" size={24} color={theme.colors.error} />
        <Text style={[styles.title, styles.errorTitle]}>{title}</Text>
      </View>
      
      <Text style={styles.errorMessage}>{message}</Text>
      
      {onRetry && (
        <Button
          mode="outlined"
          onPress={onRetry}
          icon="refresh"
          style={styles.retryButton}
        >
          Try Again
        </Button>
      )}
    </Card.Content>
  </Card>
);

export const SuccessCard = ({ title, message, actions }) => (
  <Card style={[styles.card, styles.successCard]}>
    <Card.Content style={styles.content}>
      <View style={styles.header}>
        <Icon name="check-circle" size={24} color={theme.colors.success} />
        <Text style={[styles.title, styles.successTitle]}>{title}</Text>
      </View>
      
      <Text style={styles.message}>{message}</Text>
      
      {actions && (
        <View style={styles.actionsContainer}>
          {actions}
        </View>
      )}
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  errorCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  errorTitle: {
    color: theme.colors.error,
  },
  errorMessage: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: 12,
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
  successCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  successTitle: {
    color: theme.colors.success,
  },
  message: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

import React from 'react';
import { View, StyleSheet, ScrollView, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useTheme } from '../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import WebIcon from '../components/WebIcon';

const { width } = Dimensions.get('window');

export default function HomeScreenContent() {
  const { theme, isDarkMode } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.stagger(200, [
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

  const features = [
    {
      title: 'Encrypt Files',
      description: 'Secure your files with military-grade AES-256 encryption',
      icon: 'lock',
      gradient: ['#667eea', '#764ba2'],
      emoji: '🔐',
    },
    {
      title: 'Decrypt Files',
      description: 'Safely decrypt and access your secured files',
      icon: 'lock-open',
      gradient: ['#f093fb', '#f5576c'],
      emoji: '🔓',
    },
    {
      title: 'Smart Sharing',
      description: 'Share files with time-limited secure access codes',
      icon: 'share',
      gradient: ['#4facfe', '#00f2fe'],
      emoji: '📤',
    },
    {
      title: 'Auto-Delete',
      description: 'Files automatically delete for maximum security',
      icon: 'access-time',
      gradient: ['#43e97b', '#38f9d7'],
      emoji: '⏰',
    },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <Animated.View
        style={[
          styles.heroContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <LinearGradient
          colors={isDarkMode ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : ['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']}
          style={styles.heroGradient}
        >
          <Text style={[styles.heroTitle, { color: theme.colors.onSurface }]}>
            🔐 SecureFile Transfer
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Military-grade encryption meets beautiful design
          </Text>
          <Text style={[styles.heroDescription, { color: theme.colors.onSurfaceVariant }]}>
            Protect your sensitive files with AES-256 encryption, share them securely, and enjoy automatic deletion for ultimate privacy.
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Stats Section */}
      <Animated.View
        style={[
          styles.statsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(102, 126, 234, 0.1)' }]}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>256-bit</Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Encryption</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(240, 147, 251, 0.1)' }]}>
            <Text style={[styles.statNumber, { color: '#f093fb' }]}>100%</Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Secure</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(79, 172, 254, 0.1)' }]}>
            <Text style={[styles.statNumber, { color: '#4facfe' }]}>Auto</Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Delete</Text>
          </View>
        </View>
      </Animated.View>

      {/* Features Grid */}
      <View style={styles.featuresGrid}>
        {features.map((feature, index) => (
          <Animated.View
            key={index}
            style={[
              {
                opacity: fadeAnim,
                transform: [{ 
                  translateY: Animated.add(slideAnim, new Animated.Value(index * 10))
                }],
              }
            ]}
          >
            <TouchableOpacity activeOpacity={0.9}>
              <LinearGradient
                colors={isDarkMode ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : feature.gradient.map(color => color + '15')}
                style={styles.featureCard}
              >
                <View style={styles.featureHeader}>
                  <LinearGradient
                    colors={feature.gradient}
                    style={styles.featureIconContainer}
                  >
                    <Text style={styles.featureEmoji}>{feature.emoji}</Text>
                  </LinearGradient>
                  <View style={styles.featureTextContainer}>
                    <Text style={[styles.featureTitle, { color: theme.colors.onSurface }]}>
                      {feature.title}
                    </Text>
                    <Text style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* CTA Section */}
      <Animated.View
        style={[
          styles.ctaContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.ctaGradient}
        >
          <Text style={styles.ctaTitle}>Ready to secure your files?</Text>
          <Text style={styles.ctaSubtitle}>Start encrypting your sensitive data now</Text>
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
            <Text style={styles.ctaButtonText}>Get Started 🚀</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    margin: 20,
    marginTop: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 30,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    opacity: 0.9,
  },
  heroDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  statsContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  featuresGrid: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  featureCard: {
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureEmoji: {
    fontSize: 28,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  ctaContainer: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 40,
  },
  ctaGradient: {
    padding: 30,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});

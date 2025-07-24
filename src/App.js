import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

// Import screen components
import HomeScreenContent from './screens/HomeScreenContent';
import EncryptScreenWeb from './screens/EncryptScreenWeb';
import DecryptScreenWeb from './screens/DecryptScreenWeb';
import ShareScreenWeb from './screens/ShareScreenWebSimple';
import ReceiveScreenWeb from './screens/ReceiveScreenWeb';
import SettingsScreen from './screens/SettingsScreen';

// Simple tab navigation for web compatibility
function AppContent() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = React.useState('Home');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateTabChange = (tabName) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    setActiveTab(tabName);
  };

  const tabs = [
    { name: 'Home', icon: '🏠', component: HomeScreenContent, gradient: ['#9333ea', '#a855f7'] },
    { name: 'Encrypt', icon: '🔒', component: EncryptScreenWeb, gradient: ['#8b5cf6', '#a78bfa'] },
    { name: 'Decrypt', icon: '🔓', component: DecryptScreenWeb, gradient: ['#7c3aed', '#8b5cf6'] },
    { name: 'Share', icon: '📤', component: ShareScreenWeb, gradient: ['#9333ea', '#a855f7'] },
    { name: 'Receive', icon: '📥', component: ReceiveScreenWeb, gradient: ['#a855f7', '#c084fc'] },
    { name: 'Settings', icon: '⚙️', component: SettingsScreen, gradient: ['#c084fc', '#ddd6fe'] },
  ];

  const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component;
  const activeTabData = tabs.find(tab => tab.name === activeTab);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Animated Header with Gradient */}
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
          colors={isDarkMode ? ['#1a1a2e', '#16213e'] : activeTabData?.gradient || ['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.headerTitle, { color: '#ffffff' }]}>
                🔐 SecureFile
              </Text>
              <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
                {activeTab} • Secure Transfer
              </Text>
            </View>
            <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
              <Animated.View
                style={[
                  styles.themeToggleContainer,
                  {
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    transform: [{ scale: scaleAnim }],
                  }
                ]}
              >
                <Text style={[styles.themeToggleText, { color: '#ffffff' }]}>
                  {isDarkMode ? '☀️' : '🌙'}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Animated Content */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        {ActiveComponent && <ActiveComponent />}
      </Animated.View>

      {/* Modern Glass-morphism Tab Navigation */}
      <Animated.View
        style={[
          styles.tabBarContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(slideAnim, -1) }],
          }
        ]}
      >
        <View style={[
          styles.tabBar, 
          { 
            backgroundColor: isDarkMode 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(255, 255, 255, 0.9)',
            borderTopColor: isDarkMode 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.1)',
          }
        ]}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.name}
              style={[
                styles.tab,
                activeTab === tab.name && styles.activeTab,
                activeTab === tab.name && {
                  backgroundColor: isDarkMode 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'rgba(0, 0, 0, 0.08)',
                }
              ]}
              onPress={() => animateTabChange(tab.name)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.tabContent,
                  {
                    transform: [{
                      scale: activeTab === tab.name ? 1.1 : 1
                    }]
                  }
                ]}
              >
                <Text style={[
                  styles.tabIcon, 
                  { 
                    color: activeTab === tab.name 
                      ? (isDarkMode ? '#ffffff' : theme.colors.primary)
                      : (isDarkMode ? 'rgba(255,255,255,0.6)' : theme.colors.onSurfaceVariant)
                  }
                ]}>
                  {tab.icon}
                </Text>
                <Text style={[
                  styles.tabLabel, 
                  { 
                    color: activeTab === tab.name 
                      ? (isDarkMode ? '#ffffff' : theme.colors.primary)
                      : (isDarkMode ? 'rgba(255,255,255,0.6)' : theme.colors.onSurfaceVariant),
                    fontWeight: activeTab === tab.name ? '700' : '500'
                  }
                ]}>
                  {tab.name}
                </Text>
              </Animated.View>
              {activeTab === tab.name && (
                <Animated.View
                  style={[
                    styles.activeIndicator,
                    {
                      backgroundColor: isDarkMode ? '#ffffff' : theme.colors.primary,
                    }
                  ]}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: Platform.OS === 'web' ? '100vh' : '100%',
    position: 'relative',
  },
  headerContainer: {
    zIndex: 10,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
    opacity: 0.9,
  },
  themeToggle: {
    padding: 4,
  },
  themeToggleContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  themeToggleText: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    paddingBottom: Platform.OS === 'web' ? 100 : 110,
    overflow: 'hidden',
  },
  tabBarContainer: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'web' ? 16 : 30,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backdropFilter: 'blur(20px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
    position: 'relative',
    marginHorizontal: 2,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

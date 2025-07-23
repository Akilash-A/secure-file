import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

// Import screen components
import HomeScreenContent from './screens/HomeScreenContent';
import EncryptScreenWeb from './screens/EncryptScreenWeb';
import DecryptScreenWeb from './screens/DecryptScreenWeb';
import ReceiveScreenWeb from './screens/ReceiveScreenWeb';
import SettingsScreen from './screens/SettingsScreen';

// Simple tab navigation for web compatibility
function AppContent() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = React.useState('Home');

  const tabs = [
    { name: 'Home', icon: '🏠', component: HomeScreenContent },
    { name: 'Encrypt', icon: '🔒', component: EncryptScreenWeb },
    { name: 'Decrypt', icon: '🔓', component: DecryptScreenWeb },
    { name: 'Receive', icon: '📥', component: ReceiveScreenWeb },
    { name: 'Settings', icon: '⚙️', component: SettingsScreen },
  ];

  const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>
          Secure File Transfer
        </Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <Text style={[styles.themeToggleText, { color: theme.colors.onPrimary }]}>
            {isDarkMode ? '☀️' : '🌙'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {ActiveComponent && <ActiveComponent />}
      </View>

      {/* Fixed Tab Navigation */}
      <View style={[styles.tabBar, { 
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.outline,
      }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tab, activeTab === tab.name && { 
              backgroundColor: theme.colors.primaryContainer 
            }]}
            onPress={() => setActiveTab(tab.name)}
          >
            <Text style={[styles.tabIcon, { 
              color: activeTab === tab.name ? theme.colors.primary : theme.colors.onSurfaceVariant 
            }]}>
              {tab.icon}
            </Text>
            <Text style={[styles.tabLabel, { 
              color: activeTab === tab.name ? theme.colors.primary : theme.colors.onSurfaceVariant 
            }]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'web' ? 16 : 40,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  themeToggle: {
    padding: 8,
  },
  themeToggleText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingBottom: Platform.OS === 'web' ? 80 : 90, // Add padding to account for fixed tab bar
    overflow: 'hidden',
  },
  tabBar: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'web' ? 8 : 20,
    zIndex: 1000, // High z-index to ensure it stays on top
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});

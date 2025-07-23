import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import WebIcon from './components/WebIcon';

// Import screens
import HomeScreenContent from './screens/HomeScreenContent';
import EncryptScreenContent from './screens/EncryptScreenContent';
import DecryptScreenContent from './screens/DecryptScreenContent';
import HistoryScreenContent from './screens/HistoryScreenContent';
import SettingsScreen from './screens/SettingsScreen';

function TabNavigator() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = React.useState('Home');

  const tabs = [
    { name: 'Home', icon: 'home', component: HomeScreenContent },
    { name: 'Encrypt', icon: 'lock', component: EncryptScreenContent },
    { name: 'Decrypt', icon: 'lock-open', component: DecryptScreenContent },
    { name: 'History', icon: 'history', component: HistoryScreenContent },
    { name: 'Settings', icon: 'settings', component: SettingsScreen },
  ];

  const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component || HomeScreenContent;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>
          {activeTab === 'Home' ? 'Secure File Transfer' : 
           activeTab === 'Encrypt' ? 'Encrypt Files' :
           activeTab === 'Decrypt' ? 'Decrypt Files' :
           activeTab === 'History' ? 'History' : 'Settings'}
        </Text>
        {activeTab === 'Home' && (
          <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
            <WebIcon 
              name={isDarkMode ? 'wb-sunny' : 'nights-stay'} 
              size={24} 
              color={theme.colors.onPrimary} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ActiveComponent />
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { 
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.outline,
      }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => setActiveTab(tab.name)}
          >
            <WebIcon
              name={tab.icon}
              size={24}
              color={activeTab === tab.name ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
            <Text style={[
              styles.tabLabel,
              { 
                color: activeTab === tab.name ? theme.colors.primary : theme.colors.onSurfaceVariant 
              }
            ]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function AppContent() {
  const { theme } = useTheme();
  
  return (
    <PaperProvider theme={theme}>
      <TabNavigator />
    </PaperProvider>
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
  },
  header: {
    paddingTop: Platform.OS === 'web' ? 20 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  themeToggle: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});

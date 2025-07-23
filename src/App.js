import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WebIcon from './components/WebIcon';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

import HomeScreen from './screens/HomeScreen';
import EncryptScreen from './screens/EncryptScreen';
import DecryptScreen from './screens/DecryptScreen';
import ReceiveScreen from './screens/ReceiveScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function AppContent() {
  const { theme, isDarkMode } = useTheme();

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = 'home';
              } else if (route.name === 'Encrypt') {
                iconName = 'lock';
              } else if (route.name === 'Decrypt') {
                iconName = 'lock-open';
              } else if (route.name === 'Receive') {
                iconName = 'download';
              } else if (route.name === 'History') {
                iconName = 'history';
              } else if (route.name === 'Settings') {
                iconName = 'settings';
              }

              return <WebIcon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.outline,
            },
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: theme.colors.onPrimary,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{
              title: 'Secure Transfer',
              headerRight: () => {
                const { toggleTheme, isDarkMode } = useTheme();
                return (
                  <TouchableOpacity
                    onPress={toggleTheme}
                    style={{ marginRight: 15, padding: 5 }}
                  >
                    <WebIcon 
                      name={isDarkMode ? 'wb-sunny' : 'nights-stay'} 
                      size={24} 
                      color={theme.colors.onPrimary} 
                    />
                  </TouchableOpacity>
                );
              },
            }}
          />
          <Tab.Screen 
            name="Encrypt" 
            component={EncryptScreen} 
            options={{ title: 'Encrypt Files' }}
          />
          <Tab.Screen 
            name="Decrypt" 
            component={DecryptScreen} 
            options={{ title: 'Decrypt Files' }}
          />
          <Tab.Screen 
            name="Receive" 
            component={ReceiveScreen} 
            options={{ title: 'Receive Files' }}
          />
          <Tab.Screen 
            name="History" 
            component={HistoryScreen} 
            options={{ title: 'History' }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{ title: 'Settings' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
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

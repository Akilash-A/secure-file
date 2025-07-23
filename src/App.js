import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from './screens/HomeScreen';
import EncryptScreen from './screens/EncryptScreen';
import DecryptScreen from './screens/DecryptScreen';
import ReceiveScreen from './screens/ReceiveScreen';
import HistoryScreen from './screens/HistoryScreen';
import { theme } from './theme/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
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
                }

                return <Icon name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: 'gray',
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            })}
          >
            <Tab.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: 'Secure Transfer' }}
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
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

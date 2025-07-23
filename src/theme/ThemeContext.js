import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from './theme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'

  // Load theme preference on app start
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Update theme when system preference or mode changes
  useEffect(() => {
    if (themeMode === 'system') {
      setIsDarkMode(systemColorScheme === 'dark');
    } else {
      setIsDarkMode(themeMode === 'dark');
    }
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedThemeMode = await AsyncStorage.getItem('themeMode');
      if (savedThemeMode) {
        setThemeMode(savedThemeMode);
      } else {
        // Default to system preference
        setThemeMode('system');
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      setThemeMode('system');
      setIsDarkMode(systemColorScheme === 'dark');
    }
  };

  const saveThemePreference = async (mode) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    setThemeMode(newMode);
    saveThemePreference(newMode);
  };

  const setSystemTheme = () => {
    setThemeMode('system');
    saveThemePreference('system');
  };

  const setLightTheme = () => {
    setThemeMode('light');
    saveThemePreference('light');
  };

  const setDarkTheme = () => {
    setThemeMode('dark');
    saveThemePreference('dark');
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  const value = {
    theme: currentTheme,
    isDarkMode,
    themeMode,
    toggleTheme,
    setSystemTheme,
    setLightTheme,
    setDarkTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

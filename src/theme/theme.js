import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6366f1',
    accent: '#8b5cf6',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    placeholder: '#64748b',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
  },
  roundness: 12,
};

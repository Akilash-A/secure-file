import React from 'react';
import { Platform } from 'react-native';

// For web, we'll use simple text representations of icons
const WebIcon = ({ name, size = 24, color = '#000' }) => {
  if (Platform.OS === 'web') {
    const iconMap = {
      'home': '🏠',
      'lock': '🔒',
      'lock-open': '🔓',
      'download': '⬇️',
      'history': '📜',
      'folder': '📁',
      'share': '📤',
      'delete': '🗑️',
      'download-alt': '💾',
      'check-circle': '✅',
      'error': '❌',
      'info': 'ℹ️',
      'warning': '⚠️',
    };

    const icon = iconMap[name] || '📄';
    
    return (
      <span 
        style={{ 
          fontSize: size, 
          color: color,
          lineHeight: 1,
          display: 'inline-block'
        }}
      >
        {icon}
      </span>
    );
  } else {
    // For native platforms, we'll use a fallback
    const Icon = require('react-native-vector-icons/MaterialIcons').default;
    return <Icon name={name} size={size} color={color} />;
  }
};

export default WebIcon;

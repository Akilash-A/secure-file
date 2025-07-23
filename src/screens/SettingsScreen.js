import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  List,
  Switch,
  RadioButton,
  Divider,
  Card,
  Title,
  Paragraph,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import WebIcon from '../components/WebIcon';

const SettingsScreen = () => {
  const { theme, isDarkMode, themeMode, toggleTheme, setSystemTheme, setLightTheme, setDarkTheme } = useTheme();

  const themeOptions = [
    { value: 'system', label: 'System Default', icon: 'settings' },
    { value: 'light', label: 'Light Mode', icon: 'wb-sunny' },
    { value: 'dark', label: 'Dark Mode', icon: 'nights-stay' },
  ];

  const handleThemeChange = (value) => {
    switch (value) {
      case 'system':
        setSystemTheme();
        break;
      case 'light':
        setLightTheme();
        break;
      case 'dark':
        setDarkTheme();
        break;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: theme.colors.onSurface }}>Theme Settings</Title>
            <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
              Choose your preferred theme mode
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.quickToggleContainer}>
              <View style={styles.quickToggleRow}>
                <WebIcon name="brightness-6" size={24} color={theme.colors.onSurface} />
                <Text style={[styles.quickToggleText, { color: theme.colors.onSurface }]}>
                  Dark Mode
                </Text>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ 
                    false: theme.colors.surfaceVariant, 
                    true: theme.colors.primaryContainer 
                  }}
                  thumbColor={isDarkMode ? theme.colors.primary : theme.colors.outline}
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
              Theme Options
            </Title>
            
            <RadioButton.Group onValueChange={handleThemeChange} value={themeMode}>
              {themeOptions.map((option, index) => (
                <View key={option.value}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => handleThemeChange(option.value)}
                  >
                    <View style={styles.radioRow}>
                      <WebIcon 
                        name={option.icon} 
                        size={24} 
                        color={theme.colors.onSurface} 
                      />
                      <Text style={[styles.radioText, { color: theme.colors.onSurface }]}>
                        {option.label}
                      </Text>
                      <RadioButton
                        value={option.value}
                        color={theme.colors.primary}
                        uncheckedColor={theme.colors.outline}
                      />
                    </View>
                  </TouchableOpacity>
                  {index < themeOptions.length - 1 && (
                    <Divider style={{ backgroundColor: theme.colors.outline }} />
                  )}
                </View>
              ))}
            </RadioButton.Group>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: theme.colors.onSurface }}>Theme Preview</Title>
            <View style={styles.previewContainer}>
              <View style={[styles.previewItem, { backgroundColor: theme.colors.primary }]}>
                <Text style={{ color: theme.colors.onPrimary, fontSize: 12 }}>Primary</Text>
              </View>
              <View style={[styles.previewItem, { backgroundColor: theme.colors.secondary }]}>
                <Text style={{ color: theme.colors.onSecondary, fontSize: 12 }}>Secondary</Text>
              </View>
              <View style={[styles.previewItem, { backgroundColor: theme.colors.tertiary }]}>
                <Text style={{ color: theme.colors.onTertiary, fontSize: 12 }}>Tertiary</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  quickToggleContainer: {
    marginVertical: 8,
  },
  quickToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  quickToggleText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 16,
  },
  radioOption: {
    paddingVertical: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 16,
  },
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  previewItem: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
});

export default SettingsScreen;

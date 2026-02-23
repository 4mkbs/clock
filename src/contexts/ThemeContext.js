import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@clock_app_theme';

const lightTheme = {
  dark: false,
  colors: {
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    primary: '#007AFF',
    accent: '#FF9500',
    danger: '#FF3B30',
    success: '#34C759',
    border: '#C6C6C8',
    surface: '#FFFFFF',
    surfaceVariant: '#F2F2F7',
    inputBackground: '#E5E5EA',
    tabBar: '#FFFFFF',
    tabBarInactive: '#8E8E93',
    statusBar: 'dark',
    overlay: 'rgba(0,0,0,0.4)',
    lapEven: '#F2F2F7',
    lapOdd: '#FFFFFF',
  },
};

const darkTheme = {
  dark: true,
  colors: {
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    primary: '#0A84FF',
    accent: '#FF9F0A',
    danger: '#FF453A',
    success: '#30D158',
    border: '#38383A',
    surface: '#1C1C1E',
    surfaceVariant: '#2C2C2E',
    inputBackground: '#2C2C2E',
    tabBar: '#1C1C1E',
    tabBarInactive: '#636366',
    statusBar: 'light',
    overlay: 'rgba(0,0,0,0.6)',
    lapEven: '#1C1C1E',
    lapOdd: '#2C2C2E',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved !== null) {
        setIsDark(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Failed to load theme:', e);
    }
  };

  const toggleTheme = async () => {
    try {
      const newValue = !isDark;
      setIsDark(newValue);
      await AsyncStorage.setItem(THEME_KEY, JSON.stringify(newValue));
    } catch (e) {
      console.log('Failed to save theme:', e);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

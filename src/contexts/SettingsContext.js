import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@clock_app_settings';

const defaultSettings = {
  use24Hour: false,
  clockStyle: 'digital', // 'digital' | 'analog'
  showSeconds: true,
  soundEnabled: true,
  vibrationEnabled: true,
  defaultAlarmSound: 'default',
  defaultTimerSound: 'default',
  autoDeleteAlarms: false,
};

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.log('Failed to load settings:', e);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const updated = { ...settings, [key]: value };
      setSettings(updated);
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.log('Failed to save setting:', e);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

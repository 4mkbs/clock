import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import AppNavigator from './src/navigation/AppNavigator';
import { requestPermissions } from './src/utils/notifications';
import { playAlarmSound } from './src/utils/soundService';

const AppContent = () => {
  const { theme, isDark } = useTheme();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    requestPermissions();

    // When a notification is received while app is in foreground, play alarm sound
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        try {
          const channel = notification?.request?.content?.categoryIdentifier ||
            notification?.request?.trigger?.channelId || '';
          // Play alarm sound for alarm and timer notifications
          if (channel === 'alarms' || channel === 'timers' ||
              notification?.request?.content?.title?.includes?.('Alarm') ||
              notification?.request?.content?.title?.includes?.('Timer')) {
            playAlarmSound({ vibrate: true, loop: channel === 'alarms' });
          }
        } catch (e) {
          console.log('Notification sound handler error:', e.message);
        }
      }
    );

    // When user taps on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        // User tapped the notification — app navigates automatically
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.primary,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '900' },
        },
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AppNavigator />
      </SafeAreaView>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

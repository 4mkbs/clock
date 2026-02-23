import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import ClockScreen from '../screens/ClockScreen';
import AlarmScreen from '../screens/AlarmScreen';
import TimerScreen from '../screens/TimerScreen';
import StopwatchScreen from '../screens/StopwatchScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ label, icon, focused, color }) => (
  <Text style={[styles.tabIcon, { color }]}>{icon}</Text>
);

const AppNavigator = () => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Clock"
        component={ClockScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon label="Clock" icon="🕐" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Alarm"
        component={AlarmScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon label="Alarm" icon="⏰" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Timer"
        component={TimerScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon label="Timer" icon="⏳" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Stopwatch"
        component={StopwatchScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon label="Stopwatch" icon="⏱️" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon label="Settings" icon="⚙️" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 22,
  },
});

export default AppNavigator;

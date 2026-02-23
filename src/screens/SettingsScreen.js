import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';

const SettingsScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { settings, updateSetting } = useSettings();
  const colors = theme.colors;

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );

  const SettingRow = ({ label, description, children, isLast }) => (
    <View
      style={[
        styles.settingRow,
        !isLast && { borderBottomWidth: 0.5, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
        {description && (
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      {children}
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>

      {/* Appearance */}
      <Section title="APPEARANCE">
        <SettingRow label="Dark Mode" description="Switch between light and dark theme">
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.inputBackground, true: colors.primary + '60' }}
            thumbColor={isDark ? colors.primary : colors.textSecondary}
          />
        </SettingRow>
        <SettingRow
          label="Clock Style"
          description="Choose digital or analog display"
          isLast
        >
          <View style={styles.segmentControl}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                settings.clockStyle === 'digital' && {
                  backgroundColor: colors.primary,
                },
                { borderColor: colors.primary },
              ]}
              onPress={() => updateSetting('clockStyle', 'digital')}
            >
              <Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      settings.clockStyle === 'digital' ? '#FFFFFF' : colors.primary,
                  },
                ]}
              >
                Digital
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                settings.clockStyle === 'analog' && {
                  backgroundColor: colors.primary,
                },
                { borderColor: colors.primary },
              ]}
              onPress={() => updateSetting('clockStyle', 'analog')}
            >
              <Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      settings.clockStyle === 'analog' ? '#FFFFFF' : colors.primary,
                  },
                ]}
              >
                Analog
              </Text>
            </TouchableOpacity>
          </View>
        </SettingRow>
      </Section>

      {/* Time Format */}
      <Section title="TIME FORMAT">
        <SettingRow
          label="24-Hour Format"
          description="Use 24-hour time instead of 12-hour (AM/PM)"
        >
          <Switch
            value={settings.use24Hour}
            onValueChange={(val) => updateSetting('use24Hour', val)}
            trackColor={{ false: colors.inputBackground, true: colors.primary + '60' }}
            thumbColor={settings.use24Hour ? colors.primary : colors.textSecondary}
          />
        </SettingRow>
        <SettingRow label="Show Seconds" description="Display seconds on the clock" isLast>
          <Switch
            value={settings.showSeconds}
            onValueChange={(val) => updateSetting('showSeconds', val)}
            trackColor={{ false: colors.inputBackground, true: colors.primary + '60' }}
            thumbColor={settings.showSeconds ? colors.primary : colors.textSecondary}
          />
        </SettingRow>
      </Section>

      {/* Sound & Vibration */}
      <Section title="SOUND & VIBRATION">
        <SettingRow label="Sound" description="Play sound for alarms and timers">
          <Switch
            value={settings.soundEnabled}
            onValueChange={(val) => updateSetting('soundEnabled', val)}
            trackColor={{ false: colors.inputBackground, true: colors.primary + '60' }}
            thumbColor={settings.soundEnabled ? colors.primary : colors.textSecondary}
          />
        </SettingRow>
        <SettingRow label="Vibration" description="Vibrate when alarm or timer fires" isLast>
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={(val) => updateSetting('vibrationEnabled', val)}
            trackColor={{ false: colors.inputBackground, true: colors.primary + '60' }}
            thumbColor={settings.vibrationEnabled ? colors.primary : colors.textSecondary}
          />
        </SettingRow>
      </Section>

      {/* Alarm Defaults */}
      <Section title="ALARM DEFAULTS">
        <SettingRow
          label="Auto-delete Alarms"
          description="Automatically remove one-time alarms after they ring"
          isLast
        >
          <Switch
            value={settings.autoDeleteAlarms}
            onValueChange={(val) => updateSetting('autoDeleteAlarms', val)}
            trackColor={{ false: colors.inputBackground, true: colors.primary + '60' }}
            thumbColor={settings.autoDeleteAlarms ? colors.primary : colors.textSecondary}
          />
        </SettingRow>
      </Section>

      {/* About */}
      <Section title="ABOUT">
        <SettingRow label="Version" isLast>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>1.0.0</Text>
        </SettingRow>
      </Section>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          🕒 Clock App • Built with Expo
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 3,
  },
  segmentControl: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  versionText: {
    fontSize: 15,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 13,
  },
});

export default SettingsScreen;

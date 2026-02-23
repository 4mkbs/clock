import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import {
  formatTime,
  formatTimeForTimezone,
  getTimezoneOffset,
  TIMEZONES,
} from '../utils/helpers';
import { getWorldClocks, addWorldClock, removeWorldClock } from '../utils/storage';
import AnalogClock from '../components/AnalogClock';

const { width } = Dimensions.get('window');

const ClockScreen = () => {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [worldClocks, setWorldClocks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWorldClocks();
    }, [])
  );

  const loadWorldClocks = async () => {
    const clocks = await getWorldClocks();
    setWorldClocks(clocks);
  };

  const handleAddClock = async (tz) => {
    const updated = await addWorldClock({
      city: tz.city,
      country: tz.country,
      timezone: tz.timezone,
      flag: tz.flag,
    });
    setWorldClocks(updated);
    setShowAddModal(false);
    setSearchQuery('');
  };

  const handleRemoveClock = async (timezone) => {
    const updated = await removeWorldClock(timezone);
    setWorldClocks(updated);
  };

  const filteredTimezones = TIMEZONES.filter(
    (tz) =>
      tz.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tz.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const colors = theme.colors;
  const now = currentTime;

  const renderWorldClock = ({ item }) => (
    <TouchableOpacity
      style={[styles.worldClockItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onLongPress={() => handleRemoveClock(item.timezone)}
    >
      <View style={styles.worldClockLeft}>
        <Text style={[styles.worldClockFlag]}>{item.flag}</Text>
        <View>
          <Text style={[styles.worldClockCity, { color: colors.text }]}>{item.city}</Text>
          <Text style={[styles.worldClockOffset, { color: colors.textSecondary }]}>
            {getTimezoneOffset(item.timezone)}
          </Text>
        </View>
      </View>
      <Text style={[styles.worldClockTime, { color: colors.text }]}>
        {formatTimeForTimezone(item.timezone, settings.use24Hour)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Clock */}
        <View style={styles.mainClockContainer}>
          {settings.clockStyle === 'analog' ? (
            <AnalogClock
              size={width * 0.7}
              hours={now.getHours()}
              minutes={now.getMinutes()}
              seconds={now.getSeconds()}
              theme={theme}
            />
          ) : (
            <View style={styles.digitalContainer}>
              <Text style={[styles.digitalTime, { color: colors.text }]}>
                {formatTime(now, settings.use24Hour, false)}
              </Text>
              {settings.showSeconds && (
                <Text style={[styles.digitalSeconds, { color: colors.primary }]}>
                  :{String(now.getSeconds()).padStart(2, '0')}
                </Text>
              )}
            </View>
          )}
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {now.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* World Clocks */}
        <View style={styles.worldClocksSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>World Clocks</Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {worldClocks.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No world clocks added. Tap "Add" to add one.
            </Text>
          ) : (
            worldClocks.map((item) => (
              <View key={item.timezone}>{renderWorldClock({ item })}</View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add City Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => { setShowAddModal(false); setSearchQuery(''); }}>
                <Text style={[styles.modalCancel, { color: colors.primary }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add City</Text>
              <View style={{ width: 50 }} />
            </View>

            <TextInput
              style={[styles.searchInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
              placeholder="Search cities..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />

            <FlatList
              data={filteredTimezones}
              keyExtractor={(item) => `${item.city}_${item.timezone}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.timezoneItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleAddClock(item)}
                >
                  <Text style={{ fontSize: 24, marginRight: 12 }}>{item.flag}</Text>
                  <View>
                    <Text style={[styles.tzCity, { color: colors.text }]}>{item.city}</Text>
                    <Text style={[styles.tzCountry, { color: colors.textSecondary }]}>
                      {item.country}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  mainClockContainer: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  digitalContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  digitalTime: {
    fontSize: 64,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  digitalSeconds: {
    fontSize: 32,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  dateText: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: '400',
  },
  worldClocksSection: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 20,
  },
  worldClockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 0.5,
  },
  worldClockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  worldClockFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  worldClockCity: {
    fontSize: 17,
    fontWeight: '600',
  },
  worldClockOffset: {
    fontSize: 13,
    marginTop: 2,
  },
  worldClockTime: {
    fontSize: 24,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  modalCancel: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchInput: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    fontSize: 16,
  },
  timezoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  tzCity: {
    fontSize: 16,
    fontWeight: '600',
  },
  tzCountry: {
    fontSize: 13,
    marginTop: 2,
  },
});

export default ClockScreen;

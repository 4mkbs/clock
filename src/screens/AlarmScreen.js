import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { DAYS_OF_WEEK, ALARM_SOUNDS, padZero } from '../utils/helpers';
import { getAlarms, saveAlarms } from '../utils/storage';
import {
  scheduleAlarmNotification,
  cancelAlarmNotification,
  requestPermissions,
} from '../utils/notifications';

const AlarmScreen = () => {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const [alarms, setAlarms] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState(null);

  // Editor state
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [label, setLabel] = useState('');
  const [repeatDays, setRepeatDays] = useState([]);
  const [soundId, setSoundId] = useState('default');
  const [vibrate, setVibrate] = useState(true);
  const [autoDelete, setAutoDelete] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, [])
  );

  const loadAlarms = async () => {
    const data = await getAlarms();
    setAlarms(data);
  };

  const openNewAlarm = () => {
    const now = new Date();
    setEditingAlarm(null);
    setSelectedHour(now.getHours());
    setSelectedMinute(now.getMinutes());
    setLabel('');
    setRepeatDays([]);
    setSoundId('default');
    setVibrate(true);
    setAutoDelete(false);
    setShowEditor(true);
  };

  const openEditAlarm = (alarm) => {
    setEditingAlarm(alarm);
    setSelectedHour(alarm.hour);
    setSelectedMinute(alarm.minute);
    setLabel(alarm.label || '');
    setRepeatDays(alarm.repeatDays || []);
    setSoundId(alarm.soundId || 'default');
    setVibrate(alarm.vibrate !== false);
    setAutoDelete(alarm.autoDelete || false);
    setShowEditor(true);
  };

  const handleSaveAlarm = async () => {
    await requestPermissions();

    const alarmData = {
      id: editingAlarm?.id || `alarm_${Date.now()}`,
      hour: selectedHour,
      minute: selectedMinute,
      label,
      repeatDays,
      soundId,
      vibrate,
      autoDelete,
      enabled: true,
      createdAt: editingAlarm?.createdAt || new Date().toISOString(),
    };

    let updated;
    if (editingAlarm) {
      updated = alarms.map((a) => (a.id === editingAlarm.id ? alarmData : a));
    } else {
      updated = [...alarms, alarmData];
    }

    setAlarms(updated);
    await saveAlarms(updated);
    await scheduleAlarmNotification(alarmData);
    setShowEditor(false);
  };

  const handleDeleteAlarm = async (id) => {
    Alert.alert('Delete Alarm', 'Are you sure you want to delete this alarm?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await cancelAlarmNotification(id);
          const updated = alarms.filter((a) => a.id !== id);
          setAlarms(updated);
          await saveAlarms(updated);
        },
      },
    ]);
  };

  const handleToggleAlarm = async (alarm) => {
    const updated = alarms.map((a) => {
      if (a.id === alarm.id) {
        return { ...a, enabled: !a.enabled };
      }
      return a;
    });
    setAlarms(updated);
    await saveAlarms(updated);

    if (!alarm.enabled) {
      await scheduleAlarmNotification(alarm);
    } else {
      await cancelAlarmNotification(alarm.id);
    }
  };

  const toggleRepeatDay = (day) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const formatAlarmTime = (hour, minute) => {
    if (settings.use24Hour) {
      return `${padZero(hour)}:${padZero(minute)}`;
    }
    const period = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${padZero(h12)}:${padZero(minute)} ${period}`;
  };

  const getRepeatText = (days) => {
    if (!days || days.length === 0) return 'Once';
    if (days.length === 7) return 'Every day';
    const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri'];
    const weekend = ['sat', 'sun'];
    if (weekdays.every((d) => days.includes(d)) && days.length === 5) return 'Weekdays';
    if (weekend.every((d) => days.includes(d)) && days.length === 2) return 'Weekends';
    return days.map((d) => DAYS_OF_WEEK.find((day) => day.key === d)?.short).join(', ');
  };

  const colors = theme.colors;

  const renderAlarm = ({ item }) => (
    <TouchableOpacity
      style={[styles.alarmItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => openEditAlarm(item)}
      onLongPress={() => handleDeleteAlarm(item.id)}
    >
      <View style={styles.alarmLeft}>
        <Text
          style={[
            styles.alarmTime,
            { color: item.enabled ? colors.text : colors.textSecondary },
          ]}
        >
          {formatAlarmTime(item.hour, item.minute)}
        </Text>
        <View style={styles.alarmDetails}>
          {item.label ? (
            <Text style={[styles.alarmLabel, { color: colors.textSecondary }]}>{item.label}</Text>
          ) : null}
          <Text style={[styles.alarmRepeat, { color: colors.textSecondary }]}>
            {getRepeatText(item.repeatDays)}
          </Text>
        </View>
      </View>
      <Switch
        value={item.enabled}
        onValueChange={() => handleToggleAlarm(item)}
        trackColor={{ false: colors.inputBackground, true: colors.primary + '60' }}
        thumbColor={item.enabled ? colors.primary : colors.textSecondary}
      />
    </TouchableOpacity>
  );

  // Time picker scroll values
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Alarms</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={openNewAlarm}
        >
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Alarm List */}
      {alarms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 64 }}>⏰</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No alarms set
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Tap "+ New" to create an alarm
          </Text>
        </View>
      ) : (
        <FlatList
          data={alarms.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute))}
          keyExtractor={(item) => item.id}
          renderItem={renderAlarm}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Alarm Editor Modal */}
      <Modal
        visible={showEditor}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditor(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowEditor(false)}>
                  <Text style={[styles.modalAction, { color: colors.danger }]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {editingAlarm ? 'Edit Alarm' : 'New Alarm'}
                </Text>
                <TouchableOpacity onPress={handleSaveAlarm}>
                  <Text style={[styles.modalAction, { color: colors.primary }]}>Save</Text>
                </TouchableOpacity>
              </View>

              {/* Time Picker */}
              <View style={styles.timePickerContainer}>
                <View style={styles.timePicker}>
                  {/* Hour */}
                  <View style={styles.pickerColumn}>
                    <TouchableOpacity
                      onPress={() => setSelectedHour((prev) => (prev - 1 + 24) % 24)}
                      style={styles.pickerArrow}
                    >
                      <Text style={[styles.arrowText, { color: colors.primary }]}>▲</Text>
                    </TouchableOpacity>
                    <Text style={[styles.pickerValue, { color: colors.text }]}>
                      {settings.use24Hour
                        ? padZero(selectedHour)
                        : padZero(selectedHour % 12 || 12)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSelectedHour((prev) => (prev + 1) % 24)}
                      style={styles.pickerArrow}
                    >
                      <Text style={[styles.arrowText, { color: colors.primary }]}>▼</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.pickerSeparator, { color: colors.text }]}>:</Text>

                  {/* Minute */}
                  <View style={styles.pickerColumn}>
                    <TouchableOpacity
                      onPress={() => setSelectedMinute((prev) => (prev - 1 + 60) % 60)}
                      style={styles.pickerArrow}
                    >
                      <Text style={[styles.arrowText, { color: colors.primary }]}>▲</Text>
                    </TouchableOpacity>
                    <Text style={[styles.pickerValue, { color: colors.text }]}>
                      {padZero(selectedMinute)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSelectedMinute((prev) => (prev + 1) % 60)}
                      style={styles.pickerArrow}
                    >
                      <Text style={[styles.arrowText, { color: colors.primary }]}>▼</Text>
                    </TouchableOpacity>
                  </View>

                  {/* AM/PM */}
                  {!settings.use24Hour && (
                    <View style={styles.pickerColumn}>
                      <TouchableOpacity
                        onPress={() =>
                          setSelectedHour((prev) => (prev < 12 ? prev + 12 : prev - 12))
                        }
                        style={[
                          styles.ampmButton,
                          { backgroundColor: colors.primary + '20' },
                        ]}
                      >
                        <Text style={[styles.ampmText, { color: colors.primary }]}>
                          {selectedHour >= 12 ? 'PM' : 'AM'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {/* Label */}
              <View style={[styles.editorRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.editorLabel, { color: colors.text }]}>Label</Text>
                <TextInput
                  style={[styles.editorInput, { color: colors.text }]}
                  placeholder="Alarm"
                  placeholderTextColor={colors.textSecondary}
                  value={label}
                  onChangeText={setLabel}
                />
              </View>

              {/* Repeat Days */}
              <View style={styles.repeatSection}>
                <Text style={[styles.editorLabel, { color: colors.text, marginBottom: 10 }]}>
                  Repeat
                </Text>
                <View style={styles.daysRow}>
                  {DAYS_OF_WEEK.map((day) => (
                    <TouchableOpacity
                      key={day.key}
                      style={[
                        styles.dayButton,
                        {
                          backgroundColor: repeatDays.includes(day.key)
                            ? colors.primary
                            : colors.inputBackground,
                          borderColor: repeatDays.includes(day.key)
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                      onPress={() => toggleRepeatDay(day.key)}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          {
                            color: repeatDays.includes(day.key) ? '#FFFFFF' : colors.text,
                          },
                        ]}
                      >
                        {day.letter}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sound */}
              <View style={[styles.editorRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.editorLabel, { color: colors.text }]}>Sound</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {ALARM_SOUNDS.map((sound) => (
                    <TouchableOpacity
                      key={sound.id}
                      style={[
                        styles.soundChip,
                        {
                          backgroundColor:
                            soundId === sound.id ? colors.primary : colors.inputBackground,
                          borderColor: soundId === sound.id ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setSoundId(sound.id)}
                    >
                      <Text
                        style={[
                          styles.soundChipText,
                          { color: soundId === sound.id ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {sound.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Vibrate */}
              <View style={[styles.editorRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.editorLabel, { color: colors.text }]}>Vibrate</Text>
                <Switch
                  value={vibrate}
                  onValueChange={setVibrate}
                  trackColor={{ false: colors.inputBackground, true: colors.primary + '60' }}
                  thumbColor={vibrate ? colors.primary : colors.textSecondary}
                />
              </View>

              {/* Auto Delete */}
              <View style={[styles.editorRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.editorLabel, { color: colors.text }]}>
                  Auto-delete after ringing
                </Text>
                <Switch
                  value={autoDelete}
                  onValueChange={setAutoDelete}
                  trackColor={{ false: colors.inputBackground, true: colors.primary + '60' }}
                  thumbColor={autoDelete ? colors.primary : colors.textSecondary}
                />
              </View>

              {/* Delete button for editing */}
              {editingAlarm && (
                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: colors.danger + '15' }]}
                  onPress={() => {
                    setShowEditor(false);
                    handleDeleteAlarm(editingAlarm.id);
                  }}
                >
                  <Text style={[styles.deleteButtonText, { color: colors.danger }]}>
                    Delete Alarm
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  addBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 6,
  },
  alarmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 0.5,
  },
  alarmLeft: {
    flex: 1,
  },
  alarmTime: {
    fontSize: 40,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  alarmDetails: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 10,
  },
  alarmLabel: {
    fontSize: 14,
  },
  alarmRepeat: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 20,
    maxHeight: '88%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalAction: {
    fontSize: 16,
    fontWeight: '600',
  },
  timePickerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickerColumn: {
    alignItems: 'center',
    minWidth: 60,
  },
  pickerArrow: {
    padding: 10,
  },
  arrowText: {
    fontSize: 22,
    fontWeight: '600',
  },
  pickerValue: {
    fontSize: 52,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  pickerSeparator: {
    fontSize: 48,
    fontWeight: '200',
    marginBottom: 4,
  },
  ampmButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  ampmText: {
    fontSize: 20,
    fontWeight: '600',
  },
  editorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  editorLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  editorInput: {
    fontSize: 16,
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  },
  repeatSection: {
    paddingVertical: 14,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  soundChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  soundChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  deleteButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AlarmScreen;

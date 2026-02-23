import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Vibration,
  Dimensions,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { formatTimerDisplay, padZero } from '../utils/helpers';
import {
  scheduleTimerNotification,
  cancelTimerNotification,
  requestPermissions,
} from '../utils/notifications';

const { width } = Dimensions.get('window');

const TimerScreen = () => {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const colors = theme.colors;

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            setIsFinished(true);
            if (settings.vibrationEnabled) {
              Vibration.vibrate([0, 500, 200, 500, 200, 500]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused]);

  const handleStart = async () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds === 0) return;

    await requestPermissions();
    setRemainingTime(totalSeconds);
    setIsRunning(true);
    setIsPaused(false);
    setIsFinished(false);
    await scheduleTimerNotification(totalSeconds);
  };

  const handlePause = async () => {
    setIsPaused(true);
    await cancelTimerNotification();
  };

  const handleResume = async () => {
    setIsPaused(false);
    await requestPermissions();
    await scheduleTimerNotification(remainingTime);
  };

  const handleReset = async () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setIsFinished(false);
    setRemainingTime(0);
    await cancelTimerNotification();
  };

  const adjustValue = (setter, value, max, delta) => {
    setter((prev) => {
      const next = prev + delta;
      if (next < 0) return max;
      if (next > max) return 0;
      return next;
    });
  };

  const progress = isRunning || isPaused
    ? remainingTime / (hours * 3600 + minutes * 60 + seconds || 1)
    : 1;

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  // Preset timers
  const presets = [
    { label: '1 min', h: 0, m: 1, s: 0 },
    { label: '3 min', h: 0, m: 3, s: 0 },
    { label: '5 min', h: 0, m: 5, s: 0 },
    { label: '10 min', h: 0, m: 10, s: 0 },
    { label: '15 min', h: 0, m: 15, s: 0 },
    { label: '30 min', h: 0, m: 30, s: 0 },
    { label: '1 hour', h: 1, m: 0, s: 0 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!isRunning && !isPaused && !isFinished ? (
        // ── INPUT MODE ──
        <View style={styles.inputContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Set Timer</Text>

          {/* Time Input */}
          <View style={styles.timeInputRow}>
            {/* Hours */}
            <View style={styles.inputColumn}>
              <TouchableOpacity
                onPress={() => adjustValue(setHours, hours, 23, 1)}
                style={styles.arrowBtn}
              >
                <Text style={[styles.arrowText, { color: colors.primary }]}>▲</Text>
              </TouchableOpacity>
              <Text style={[styles.inputValue, { color: colors.text }]}>{padZero(hours)}</Text>
              <TouchableOpacity
                onPress={() => adjustValue(setHours, hours, 23, -1)}
                style={styles.arrowBtn}
              >
                <Text style={[styles.arrowText, { color: colors.primary }]}>▼</Text>
              </TouchableOpacity>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Hours</Text>
            </View>

            <Text style={[styles.separator, { color: colors.text }]}>:</Text>

            {/* Minutes */}
            <View style={styles.inputColumn}>
              <TouchableOpacity
                onPress={() => adjustValue(setMinutes, minutes, 59, 1)}
                style={styles.arrowBtn}
              >
                <Text style={[styles.arrowText, { color: colors.primary }]}>▲</Text>
              </TouchableOpacity>
              <Text style={[styles.inputValue, { color: colors.text }]}>{padZero(minutes)}</Text>
              <TouchableOpacity
                onPress={() => adjustValue(setMinutes, minutes, 59, -1)}
                style={styles.arrowBtn}
              >
                <Text style={[styles.arrowText, { color: colors.primary }]}>▼</Text>
              </TouchableOpacity>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Min</Text>
            </View>

            <Text style={[styles.separator, { color: colors.text }]}>:</Text>

            {/* Seconds */}
            <View style={styles.inputColumn}>
              <TouchableOpacity
                onPress={() => adjustValue(setSeconds, seconds, 59, 1)}
                style={styles.arrowBtn}
              >
                <Text style={[styles.arrowText, { color: colors.primary }]}>▲</Text>
              </TouchableOpacity>
              <Text style={[styles.inputValue, { color: colors.text }]}>{padZero(seconds)}</Text>
              <TouchableOpacity
                onPress={() => adjustValue(setSeconds, seconds, 59, -1)}
                style={styles.arrowBtn}
              >
                <Text style={[styles.arrowText, { color: colors.primary }]}>▼</Text>
              </TouchableOpacity>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Sec</Text>
            </View>
          </View>

          {/* Presets */}
          <View style={styles.presetsContainer}>
            <Text style={[styles.presetsTitle, { color: colors.textSecondary }]}>Quick Set</Text>
            <View style={styles.presetsList}>
              {presets.map((p) => (
                <TouchableOpacity
                  key={p.label}
                  style={[styles.presetChip, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
                  onPress={() => {
                    setHours(p.h);
                    setMinutes(p.m);
                    setSeconds(p.s);
                  }}
                >
                  <Text style={[styles.presetText, { color: colors.text }]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Start Button */}
          <TouchableOpacity
            style={[
              styles.startButton,
              {
                backgroundColor:
                  hours === 0 && minutes === 0 && seconds === 0
                    ? colors.textSecondary
                    : colors.primary,
              },
            ]}
            onPress={handleStart}
            disabled={hours === 0 && minutes === 0 && seconds === 0}
          >
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // ── RUNNING / PAUSED / FINISHED MODE ──
        <View style={styles.runningContainer}>
          {/* Circular Progress */}
          <View style={styles.circleContainer}>
            <View style={styles.circleWrapper}>
              <View style={[styles.circleBackground, { borderColor: colors.inputBackground }]} />
              <View
                style={[
                  styles.circleForeground,
                  {
                    borderColor: isFinished ? colors.danger : colors.primary,
                    borderTopColor:
                      isFinished
                        ? colors.danger
                        : progress > 0.25
                        ? colors.primary
                        : colors.primary,
                  },
                ]}
              />
              <View style={styles.circleContent}>
                <Text
                  style={[
                    styles.timerDisplay,
                    { color: isFinished ? colors.danger : colors.text },
                  ]}
                >
                  {formatTimerDisplay(remainingTime)}
                </Text>
                {isFinished && (
                  <Text style={[styles.finishedText, { color: colors.danger }]}>Time's up!</Text>
                )}
              </View>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.surfaceVariant }]}
              onPress={handleReset}
            >
              <Text style={[styles.controlText, { color: colors.text }]}>Reset</Text>
            </TouchableOpacity>

            {!isFinished && (
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  {
                    backgroundColor: isPaused ? colors.primary : colors.accent,
                  },
                ]}
                onPress={isPaused ? handleResume : handlePause}
              >
                <Text style={styles.controlButtonText}>
                  {isPaused ? 'Resume' : 'Pause'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  inputColumn: {
    alignItems: 'center',
    minWidth: 70,
  },
  arrowBtn: {
    padding: 12,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: '600',
  },
  inputValue: {
    fontSize: 56,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  inputLabel: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  separator: {
    fontSize: 48,
    fontWeight: '200',
    marginBottom: 30,
  },
  presetsContainer: {
    marginTop: 32,
  },
  presetsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '500',
  },
  startButton: {
    marginTop: 40,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  runningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  circleContainer: {
    marginBottom: 50,
  },
  circleWrapper: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBackground: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 6,
  },
  circleForeground: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 6,
  },
  circleContent: {
    alignItems: 'center',
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  finishedText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  controlButton: {
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 30,
  },
  controlText: {
    fontSize: 17,
    fontWeight: '600',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default TimerScreen;

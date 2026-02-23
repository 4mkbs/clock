import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { formatStopwatchTime } from '../utils/helpers';

const StopwatchScreen = () => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const accumulatedRef = useRef(0);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startStopwatch = () => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsedTime(accumulatedRef.current + (Date.now() - startTimeRef.current));
    }, 10);
    setIsRunning(true);
  };

  const stopStopwatch = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    accumulatedRef.current += Date.now() - startTimeRef.current;
    setIsRunning(false);
  };

  const resetStopwatch = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setElapsedTime(0);
    accumulatedRef.current = 0;
    setLaps([]);
  };

  const recordLap = () => {
    const lastLapTime = laps.length > 0 ? laps[0].totalTime : 0;
    const lapTime = elapsedTime - lastLapTime;
    const newLap = {
      id: `lap_${Date.now()}`,
      number: laps.length + 1,
      lapTime,
      totalTime: elapsedTime,
    };
    setLaps((prev) => [newLap, ...prev]);
  };

  // Find best and worst laps
  const bestLap = laps.length > 1
    ? laps.reduce((min, lap) => (lap.lapTime < min.lapTime ? lap : min), laps[0])
    : null;
  const worstLap = laps.length > 1
    ? laps.reduce((max, lap) => (lap.lapTime > max.lapTime ? lap : max), laps[0])
    : null;

  const getLapColor = (lap) => {
    if (!bestLap || !worstLap || laps.length <= 1) return colors.text;
    if (lap.id === bestLap.id) return colors.success;
    if (lap.id === worstLap.id) return colors.danger;
    return colors.text;
  };

  const renderLap = ({ item, index }) => (
    <View
      style={[
        styles.lapRow,
        {
          backgroundColor: index % 2 === 0 ? colors.lapEven : colors.lapOdd,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.lapNumber, { color: colors.textSecondary }]}>
        Lap {item.number}
      </Text>
      <Text style={[styles.lapTime, { color: getLapColor(item) }]}>
        {formatStopwatchTime(item.lapTime)}
      </Text>
      <Text style={[styles.lapTotal, { color: colors.textSecondary }]}>
        {formatStopwatchTime(item.totalTime)}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Display */}
      <View style={styles.displayContainer}>
        <Text style={[styles.timeDisplay, { color: colors.text }]}>
          {formatStopwatchTime(elapsedTime)}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {!isRunning && elapsedTime === 0 ? (
          // Initial state
          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: colors.primary }]}
            onPress={startStopwatch}
          >
            <Text style={styles.mainButtonText}>Start</Text>
          </TouchableOpacity>
        ) : isRunning ? (
          // Running state
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.surfaceVariant }]}
              onPress={recordLap}
            >
              <Text style={[styles.controlText, { color: colors.text }]}>Lap</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.danger }]}
              onPress={stopStopwatch}
            >
              <Text style={[styles.controlButtonText]}>Stop</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Paused state
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.surfaceVariant }]}
              onPress={resetStopwatch}
            >
              <Text style={[styles.controlText, { color: colors.text }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.primary }]}
              onPress={startStopwatch}
            >
              <Text style={styles.controlButtonText}>Resume</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Lap Header */}
      {laps.length > 0 && (
        <View style={[styles.lapHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.lapHeaderText, { color: colors.textSecondary }]}>Lap</Text>
          <Text style={[styles.lapHeaderText, { color: colors.textSecondary }]}>Lap Time</Text>
          <Text style={[styles.lapHeaderText, { color: colors.textSecondary }]}>Total</Text>
        </View>
      )}

      {/* Lap List */}
      <FlatList
        data={laps}
        keyExtractor={(item) => item.id}
        renderItem={renderLap}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.lapList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  displayContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  timeDisplay: {
    fontSize: 72,
    fontWeight: '100',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  controlsContainer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  mainButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 30,
  },
  controlButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
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
  lapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  lapHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    flex: 1,
    textAlign: 'center',
  },
  lapList: {
    paddingBottom: 20,
  },
  lapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
  },
  lapNumber: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  lapTime: {
    fontSize: 17,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
    flex: 1,
    textAlign: 'center',
  },
  lapTotal: {
    fontSize: 15,
    fontVariant: ['tabular-nums'],
    flex: 1,
    textAlign: 'right',
  },
});

export default StopwatchScreen;

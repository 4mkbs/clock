import { Audio } from 'expo-av';
import { Vibration, Platform } from 'react-native';

let currentSound = null;
let vibrationInterval = null;

// Alarm vibration pattern: vibrate 500ms, pause 300ms, repeat
const ALARM_VIBRATION_PATTERN = [0, 800, 400, 800, 400, 800, 400, 800];
const TIMER_VIBRATION_PATTERN = [0, 600, 300, 600, 300, 600];

/**
 * Play the built-in alarm sound using expo-av and trigger vibration.
 * This works even while the app is in the foreground.
 */
export const playAlarmSound = async (options = {}) => {
  const { vibrate = true, loop = true } = options;

  try {
    // Stop any currently playing sound first
    await stopAlarmSound();

    // Configure audio session for alarm (play even in silent mode)
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    });

    // Use the bundled alarm WAV tone via expo-av
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/alarm.wav'),
      {
        shouldPlay: true,
        isLooping: loop,
        volume: 1.0,
      }
    );

    currentSound = sound;

    // Start vibration
    if (vibrate) {
      startVibration();
    }
  } catch (e) {
    console.log('Sound playback failed, trying fallback beep:', e.message);
    // Fallback: use system notification sound
    try {
      await playFallbackBeep(loop);
      if (vibrate) startVibration();
    } catch (e2) {
      console.log('Fallback beep also failed:', e2.message);
      // At minimum, vibrate
      if (vibrate) startVibration();
    }
  }
};

/**
 * Fallback beep using a generated sine wave buffer
 */
const playFallbackBeep = async (loop = true) => {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: false,
    playThroughEarpieceAndroid: false,
  });

  // Create a simple beep using Audio API
  const { sound } = await Audio.Sound.createAsync(
    { uri: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg' },
    {
      shouldPlay: true,
      isLooping: loop,
      volume: 1.0,
    }
  );
  currentSound = sound;
};

/**
 * Play timer completion sound (shorter, non-looping by default)
 */
export const playTimerSound = async (options = {}) => {
  const { vibrate = true } = options;
  await playAlarmSound({ vibrate, loop: false });
  // Vibrate with timer pattern
  if (vibrate) {
    Vibration.vibrate(TIMER_VIBRATION_PATTERN);
  }
};

/**
 * Start continuous vibration for alarms
 */
const startVibration = () => {
  stopVibration();
  // Initial vibration
  Vibration.vibrate(ALARM_VIBRATION_PATTERN);
  // Repeat vibration every 5 seconds
  vibrationInterval = setInterval(() => {
    Vibration.vibrate(ALARM_VIBRATION_PATTERN);
  }, 5000);
};

/**
 * Stop vibration
 */
const stopVibration = () => {
  if (vibrationInterval) {
    clearInterval(vibrationInterval);
    vibrationInterval = null;
  }
  Vibration.cancel();
};

/**
 * Stop the currently playing alarm sound and vibration
 */
export const stopAlarmSound = async () => {
  try {
    stopVibration();
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }
  } catch (e) {
    console.log('Failed to stop sound:', e.message);
    currentSound = null;
  }
};

/**
 * Check if alarm sound is currently playing
 */
export const isAlarmPlaying = () => {
  return currentSound !== null;
};

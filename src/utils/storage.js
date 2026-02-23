import AsyncStorage from '@react-native-async-storage/async-storage';

const ALARMS_KEY = '@clock_app_alarms';
const WORLD_CLOCKS_KEY = '@clock_app_world_clocks';

// ── Alarm Storage ──

export const getAlarms = async () => {
  try {
    const data = await AsyncStorage.getItem(ALARMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.log('Failed to load alarms:', e);
    return [];
  }
};

export const saveAlarms = async (alarms) => {
  try {
    await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
  } catch (e) {
    console.log('Failed to save alarms:', e);
  }
};

export const addAlarm = async (alarm) => {
  const alarms = await getAlarms();
  alarms.push(alarm);
  await saveAlarms(alarms);
  return alarms;
};

export const updateAlarm = async (id, updates) => {
  const alarms = await getAlarms();
  const index = alarms.findIndex((a) => a.id === id);
  if (index !== -1) {
    alarms[index] = { ...alarms[index], ...updates };
    await saveAlarms(alarms);
  }
  return alarms;
};

export const deleteAlarm = async (id) => {
  let alarms = await getAlarms();
  alarms = alarms.filter((a) => a.id !== id);
  await saveAlarms(alarms);
  return alarms;
};

// ── World Clocks Storage ──

export const getWorldClocks = async () => {
  try {
    const data = await AsyncStorage.getItem(WORLD_CLOCKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.log('Failed to load world clocks:', e);
    return [];
  }
};

export const saveWorldClocks = async (clocks) => {
  try {
    await AsyncStorage.setItem(WORLD_CLOCKS_KEY, JSON.stringify(clocks));
  } catch (e) {
    console.log('Failed to save world clocks:', e);
  }
};

export const addWorldClock = async (clock) => {
  const clocks = await getWorldClocks();
  if (!clocks.find((c) => c.timezone === clock.timezone)) {
    clocks.push(clock);
    await saveWorldClocks(clocks);
  }
  return clocks;
};

export const removeWorldClock = async (timezone) => {
  let clocks = await getWorldClocks();
  clocks = clocks.filter((c) => c.timezone !== timezone);
  await saveWorldClocks(clocks);
  return clocks;
};

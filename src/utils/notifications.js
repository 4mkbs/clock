import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  console.log('Notification handler setup skipped:', e.message);
}

export const requestPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alarms', {
        name: 'Alarms',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });

      await Notifications.setNotificationChannelAsync('timers', {
        name: 'Timers',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }

    return true;
  } catch (e) {
    console.log('Notifications not available:', e.message);
    return false;
  }
};

export const scheduleAlarmNotification = async (alarm) => {
  try {
    const { hour, minute, label, repeatDays, id } = alarm;

    // Cancel any existing notification for this alarm
    await cancelAlarmNotification(id);

    if (repeatDays && repeatDays.length > 0) {
      // Schedule for each repeat day
      const dayMap = { sun: 1, mon: 2, tue: 3, wed: 4, thu: 5, fri: 6, sat: 7 };
      for (const day of repeatDays) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ Alarm',
            body: label || 'Time to wake up!',
            sound: 'default',
            data: { alarmId: id, type: 'alarm' },
          },
          trigger: {
            type: 'weekly',
            weekday: dayMap[day],
            hour,
            minute,
            channelId: 'alarms',
          },
          identifier: `${id}_${day}`,
        });
      }
    } else {
      // One-time alarm
      const now = new Date();
      const alarmTime = new Date();
      alarmTime.setHours(hour, minute, 0, 0);

      if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Alarm',
          body: label || 'Time to wake up!',
          sound: 'default',
          data: { alarmId: id, type: 'alarm' },
        },
        trigger: {
          type: 'date',
          date: alarmTime,
          channelId: 'alarms',
        },
        identifier: id,
      });
    }
  } catch (e) {
    console.log('Failed to schedule alarm:', e);
  }
};

export const cancelAlarmNotification = async (alarmId) => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.identifier === alarmId || notif.identifier.startsWith(`${alarmId}_`)) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  } catch (e) {
    console.log('Failed to cancel alarm notification:', e);
  }
};

export const scheduleTimerNotification = async (seconds) => {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏳ Timer Finished',
        body: 'Your timer has completed!',
        sound: 'default',
        data: { type: 'timer' },
      },
      trigger: {
        type: 'timeInterval',
        seconds,
        channelId: 'timers',
      },
      identifier: 'timer_notification',
    });
    return id;
  } catch (e) {
    console.log('Failed to schedule timer notification:', e);
    return null;
  }
};

export const cancelTimerNotification = async () => {
  try {
    await Notifications.cancelScheduledNotificationAsync('timer_notification');
  } catch (e) {
    console.log('Failed to cancel timer notification:', e);
  }
};

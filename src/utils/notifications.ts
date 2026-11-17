import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function scheduleTaskReminder(title: string, dueDate?: string) {
  if (!dueDate || new Date(dueDate).getTime() <= Date.now()) {
    return undefined;
  }

  const permissions = await Notifications.getPermissionsAsync();
  let status = permissions.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') {
    return undefined;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('task-reminders', {
      name: 'Task reminders',
      importance: 3,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Task reminder',
      body: title,
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(dueDate),
      channelId: 'task-reminders',
    },
  });
}

export async function cancelTaskReminder(notificationId?: string) {
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
}

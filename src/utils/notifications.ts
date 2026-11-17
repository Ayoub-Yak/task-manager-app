export async function scheduleTaskReminder(title: string, dueDate?: string) {
  if (!dueDate || new Date(dueDate).getTime() <= Date.now()) {
    return undefined;
  }

  try {
    const Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    const permissions = await Notifications.getPermissionsAsync();
    let status = permissions.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== 'granted') {
      return undefined;
    }

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task reminder',
        body: title,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(dueDate),
      },
    });
  } catch (error) {
    console.warn('Task reminders are unavailable in this Expo Go runtime.', error);
    return undefined;
  }
}

export async function cancelTaskReminder(notificationId?: string) {
  if (notificationId) {
    try {
      const Notifications = await import('expo-notifications');
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.warn('Task reminder could not be cancelled.', error);
    }
  }
}

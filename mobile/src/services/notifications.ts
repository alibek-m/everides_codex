import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export const ensureNotificationPermissions = async () => {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return current;
  }

  return Notifications.requestPermissionsAsync();
};

export const scheduleLocalAlert = async (title: string, body: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body
    },
    trigger: null
  });
};

export const registerForPushToken = async () => {
  if (!Device.isDevice) {
    return null;
  }

  const permissions = await ensureNotificationPermissions();
  if (!permissions.granted) {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
};

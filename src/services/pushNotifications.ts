import { Application, Device, Utils, isAndroid, isIOS } from "@nativescript/core";
import { firebase } from "@nativescript/firebase-core";
import "@nativescript/firebase-messaging";
import { AuthorizationStatus } from "@nativescript/firebase-messaging";
import { sessionStore } from "../stores/session";
import { registerPushToken, unregisterPushToken } from "./push";

let listenersConfigured = false;
let lastRegisteredFcmToken = "";

function getPlatform(): "android" | "ios" {
  return isIOS ? "ios" : "android";
}

function isPermissionGranted(status: AuthorizationStatus): boolean {
  return status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
}

export async function setupFirebaseMessaging(): Promise<void> {
  if (listenersConfigured) return;
  listenersConfigured = true;

  ensureAndroidNotificationChannel();

  const messaging = firebase().messaging();
  messaging.showNotificationsWhenInForeground = false;
  messaging.onToken((token) => {
    if (!sessionStore.token || !token) return;
    void sendPushTokenToBackend(sessionStore.token, token);
  });
  messaging.onMessage((message) => {
    console.log("push message", JSON.stringify(message));
    showAndroidForegroundNotification({
      title: getForegroundNotificationTitle(message),
      body: getForegroundNotificationBody(message),
      type: message.data?.type,
    });
  });
  messaging.onNotificationTap((message) => {
    console.log("push tap", JSON.stringify(message));
  });
}

function getForegroundNotificationTitle(message: {
  notification?: { title?: string };
  data?: { [key: string]: string };
}): string {
  if (message.notification?.title) return message.notification.title;

  if (message.data?.type === "post_like") return "Новый лайк";
  if (message.data?.type === "post_comment") return "Новый комментарий";
  if (message.data?.type === "user_follow") return "Новый подписчик";

  return "Новое уведомление";
}

function getForegroundNotificationBody(message: {
  notification?: { body?: string };
  data?: { [key: string]: string };
}): string {
  if (message.notification?.body) return message.notification.body;

  if (message.data?.type === "post_like") return "Кто-то лайкнул ваш пост.";
  if (message.data?.type === "post_comment") return "К вашему посту оставили комментарий.";
  if (message.data?.type === "user_follow") return "На вас подписался новый пользователь.";

  return "У вас новое событие.";
}

export async function registerCurrentDeviceForPush(authToken = sessionStore.token): Promise<void> {
  if (!authToken) return;

  try {
    const messaging = firebase().messaging();
    const androidPermissionGranted = await ensureAndroidNotificationPermission();
    if (!androidPermissionGranted) return;

    const permission = await messaging.requestPermission({
      ios: {
        alert: true,
        badge: true,
        sound: true,
      },
      android: {},
    });

    if (isIOS && !isPermissionGranted(permission)) {
      return;
    }

    if (!messaging.isDeviceRegisteredForRemoteMessages) {
      await messaging.registerDeviceForRemoteMessages();
    }

    const fcmToken = await messaging.getToken();
    if (!fcmToken) return;

    await sendPushTokenToBackend(authToken, fcmToken);
  } catch (error) {
    console.log("push registration failed", error);
  }
}

export async function unregisterCurrentDeviceForPush(authToken = sessionStore.token): Promise<void> {
  if (!authToken || !lastRegisteredFcmToken) return;

  try {
    await unregisterPushToken(authToken, {
      token: lastRegisteredFcmToken,
      platform: getPlatform(),
      device_id: Device.uuid || null,
    });
  } catch (error) {
    console.log("push unregister failed", error);
  }
}

async function sendPushTokenToBackend(authToken: string, fcmToken: string): Promise<void> {
  await registerPushToken(authToken, {
    token: fcmToken,
    platform: getPlatform(),
    device_id: Device.uuid || null,
  });
  lastRegisteredFcmToken = fcmToken;
}

function showAndroidForegroundNotification(payload: {
  title: string;
  body: string;
  type?: string;
}): void {
  if (!isAndroid) return;

  try {
    const context = Utils.android.getApplicationContext();
    const manager = context.getSystemService(
      android.content.Context.NOTIFICATION_SERVICE,
    ) as android.app.NotificationManager | null;
    if (!manager) return;

    ensureAndroidNotificationChannel();

    const launchIntent = context
      .getPackageManager()
      .getLaunchIntentForPackage(context.getPackageName());
    let flags = android.app.PendingIntent.FLAG_UPDATE_CURRENT;
    if (android.os.Build.VERSION.SDK_INT >= 23) {
      flags |= android.app.PendingIntent.FLAG_IMMUTABLE;
    }
    const pendingIntent = launchIntent
      ? android.app.PendingIntent.getActivity(context, 0, launchIntent, flags)
      : null;

    const appIcon = context.getApplicationInfo().icon || android.R.drawable.ic_dialog_info;
    const builder =
      android.os.Build.VERSION.SDK_INT >= 26
        ? new android.app.Notification.Builder(context, "royality_events")
        : new android.app.Notification.Builder(context);

    builder
      .setSmallIcon(appIcon)
      .setContentTitle(payload.title)
      .setContentText(payload.body)
      .setStyle(new android.app.Notification.BigTextStyle().bigText(payload.body))
      .setAutoCancel(true)
      .setDefaults(android.app.Notification.DEFAULT_ALL)
      .setPriority(android.app.Notification.PRIORITY_HIGH)
      .setCategory(android.app.Notification.CATEGORY_SOCIAL)
      .setWhen(java.lang.System.currentTimeMillis())
      .setShowWhen(true);

    if (pendingIntent) {
      builder.setContentIntent(pendingIntent);
    }

    const notificationId = Math.floor(java.lang.System.currentTimeMillis() % 2147483647);
    manager.notify(notificationId, builder.build());
  } catch (error) {
    console.log("foreground notification failed", error);
  }
}

function ensureAndroidNotificationChannel(): void {
  if (!isAndroid || android.os.Build.VERSION.SDK_INT < 26) return;

  const context = Utils.android.getApplicationContext();
  const manager = context.getSystemService(
    android.content.Context.NOTIFICATION_SERVICE,
  ) as android.app.NotificationManager | null;
  if (!manager) return;

  const channel = new android.app.NotificationChannel(
    "royality_events",
    "Royality events",
    android.app.NotificationManager.IMPORTANCE_HIGH,
  );
  channel.setDescription("Likes, comments and follows");
  channel.enableVibration(true);
  manager.createNotificationChannel(channel);
}

async function ensureAndroidNotificationPermission(): Promise<boolean> {
  if (!isAndroid || android.os.Build.VERSION.SDK_INT < 33) return true;

  const permission = "android.permission.POST_NOTIFICATIONS";
  const activity = Application.android.foregroundActivity || Application.android.startActivity;
  if (!activity) return false;

  if (
    activity.checkSelfPermission(permission) ===
    android.content.pm.PackageManager.PERMISSION_GRANTED
  ) {
    return true;
  }

  return new Promise((resolve) => {
    const requestCode = 7001;
    const permissions = Array.create(java.lang.String, 1);
    permissions[0] = permission;

    const handler = (args: {
      requestCode: number;
      grantResults?: number[];
    }) => {
      if (args.requestCode !== requestCode) return;
      Application.android.off(Application.android.activityRequestPermissionsEvent, handler);
      resolve(
        !!args.grantResults?.length &&
          args.grantResults[0] === android.content.pm.PackageManager.PERMISSION_GRANTED,
      );
    };

    Application.android.on(Application.android.activityRequestPermissionsEvent, handler);
    activity.requestPermissions(permissions, requestCode);
  });
}

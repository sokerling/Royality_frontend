import { Device, isIOS } from "@nativescript/core";
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

  const messaging = firebase().messaging();
  messaging.showNotificationsWhenInForeground = true;
  messaging.onToken((token) => {
    if (!sessionStore.token || !token) return;
    void sendPushTokenToBackend(sessionStore.token, token);
  });
  messaging.onMessage((message) => {
    console.log("push message", JSON.stringify(message));
  });
  messaging.onNotificationTap((message) => {
    console.log("push tap", JSON.stringify(message));
  });
}

export async function registerCurrentDeviceForPush(authToken = sessionStore.token): Promise<void> {
  if (!authToken) return;

  try {
    const messaging = firebase().messaging();
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

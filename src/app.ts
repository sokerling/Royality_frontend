import "./polyfills/abortController";
import { createApp } from "nativescript-vue";
import { init as initBackgroundHttp } from "@nativescript/background-http";
import { firebase } from "@nativescript/firebase-core";
import "@nativescript/firebase-messaging";
import App from "./App.vue";
import { setupFirebaseMessaging } from "./services/pushNotifications";

async function bootstrap(): Promise<void> {
  initBackgroundHttp();

  try {
    await firebase().initializeApp();
    await setupFirebaseMessaging();
  } catch (error) {
    console.log("firebase init failed", error);
  }

  createApp(App).start();
}

void bootstrap();

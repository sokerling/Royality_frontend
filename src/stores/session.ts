import { reactive } from "nativescript-vue";
import { getString, remove } from "@nativescript/core/application-settings";
import { SecureStorage } from "@nativescript/secure-storage";
import type { UserProfileResponse } from "../types/api";

const TOKEN_KEY = "auth.access_token";
const secureStorage = new SecureStorage();

function readSecureToken(): string {
  try {
    const token = secureStorage.getSync({ key: TOKEN_KEY });
    return typeof token === "string" ? token : "";
  } catch {
    return "";
  }
}

function writeSecureToken(token: string): void {
  try {
    if (token) {
      secureStorage.setSync({ key: TOKEN_KEY, value: token });
    } else {
      secureStorage.removeSync({ key: TOKEN_KEY });
    }
  } catch {
    // Keep runtime resilient even if secure storage is temporarily unavailable.
  }
}

function bootstrapToken(): string {
  const secureToken = readSecureToken();
  if (secureToken) return secureToken;

  const legacyToken = getString(TOKEN_KEY) || "";
  if (!legacyToken) return "";

  writeSecureToken(legacyToken);
  remove(TOKEN_KEY);
  return legacyToken;
}

export const sessionStore = reactive({
  token: bootstrapToken() as string,
  profile: null as UserProfileResponse | null,
});

export function setSessionToken(token: string): void {
  sessionStore.token = token;
  writeSecureToken(token);
  remove(TOKEN_KEY);
}

export function clearSession(): void {
  sessionStore.token = "";
  sessionStore.profile = null;
  writeSecureToken("");
  remove(TOKEN_KEY);
}

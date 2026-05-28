import type { PushTokenRequest } from "../types/api";
import { httpClient } from "./http";
import { runWithXState } from "./xstateRequest";

export function registerPushToken(token: string, payload: PushTokenRequest): Promise<void> {
  return runWithXState(async (input: { token: string; payload: PushTokenRequest }) => {
    return httpClient.put<void>("/users/me/push-token", {
      token: input.token,
      body: input.payload,
    });
  }, { token, payload });
}

export function unregisterPushToken(token: string, payload: PushTokenRequest): Promise<void> {
  return runWithXState(async (input: { token: string; payload: PushTokenRequest }) => {
    return httpClient.delete<void>("/users/me/push-token", {
      token: input.token,
      body: input.payload,
    });
  }, { token, payload });
}

import type { AuthLoginResponse, SignupResponse } from "../types/api";
import { httpClient } from "./http";
import { runWithXState } from "./xstateRequest";

export function signup(login: string, password: string, name: string): Promise<SignupResponse> {
  return runWithXState(async (payload: { login: string; password: string; name: string }) => {
    return httpClient.post<SignupResponse>("/users/signup", {
      body: payload,
    });
  }, { login, password, name });
}

export async function login(loginValue: string, password: string): Promise<string> {
  const data = await runWithXState(async (payload: { login: string; password: string }) => {
    return httpClient.post<AuthLoginResponse>("/users/login", {
      body: payload,
    });
  }, { login: loginValue, password });
  return data.access_token;
}

import type { UserProfileResponse } from "../types/api";
import type { PickedImage } from "../utils/imagePicker";
import { httpClient } from "./http";
import { multipartUpload } from "./upload";
import { runWithXState } from "./xstateRequest";

export function getMyProfile(token: string): Promise<UserProfileResponse> {
  return runWithXState(async (payload: { token: string }) => {
    return httpClient.get<UserProfileResponse>("/users/me", { token: payload.token });
  }, { token });
}

interface UpdateProfilePayload {
  nickname: string;
  avatar_url: string | null;
  bio: string | null;
  level: number;
}

export function updateMyProfile(token: string, payload: UpdateProfilePayload): Promise<UserProfileResponse> {
  return runWithXState(async (input: { token: string; payload: UpdateProfilePayload }) => {
    return httpClient.put<UserProfileResponse>("/users/me", {
      token: input.token,
      body: input.payload,
    });
  }, {
    token,
    payload,
  });
}

export function uploadMyAvatar(token: string, image: PickedImage): Promise<{ url: string }> {
  return runWithXState(async (payload: { token: string; image: PickedImage }) => {
    return multipartUpload<{ url: string }>({
      sessionName: "avatar-upload",
      path: "/users/me/avatar",
      token: payload.token,
      description: "Avatar upload",
      params: [
        { name: "image", filename: payload.image.uri, mimeType: payload.image.type },
      ],
    });
  }, {
    token,
    image,
  });
}

import type { PostResponse } from "../types/api";
import type { PickedImage } from "../utils/imagePicker";
import { httpClient } from "./http";
import { multipartUpload } from "./upload";
import { runWithXState } from "./xstateRequest";

export function getFeed(token: string, limit = 20, offset = 0): Promise<PostResponse[]> {
  return runWithXState(async (payload: { token: string; limit: number; offset: number }) => {
    return httpClient.get<PostResponse[]>("/posts", {
      token: payload.token,
      query: { limit: payload.limit, offset: payload.offset },
    });
  }, {
    token,
    limit,
    offset,
  });
}

export function likePost(token: string, postId: string): Promise<void> {
  return runWithXState(async (payload: { token: string; postId: string }) => {
    return httpClient.post<void>(`/posts/${payload.postId}/like`, { token: payload.token });
  }, { token, postId });
}

export function unlikePost(token: string, postId: string): Promise<void> {
  return runWithXState(async (payload: { token: string; postId: string }) => {
    return httpClient.delete<void>(`/posts/${payload.postId}/like`, { token: payload.token });
  }, { token, postId });
}

export function getPostById(token: string, postId: string): Promise<PostResponse> {
  return runWithXState(async (payload: { token: string; postId: string }) => {
    return httpClient.get<PostResponse>(`/posts/${payload.postId}`, { token: payload.token });
  }, { token, postId });
}

export function createPost(
  token: string,
  text: string,
  image: PickedImage | null,
  disableComments = false,
): Promise<PostResponse> {
  return runWithXState(async (payload: { token: string; text: string; image: PickedImage | null; disableComments: boolean }) => {
    const params: Array<{ name: string; value?: string; filename?: string; mimeType?: string }> = [
      { name: "text", value: payload.text },
      { name: "disable_comments", value: String(payload.disableComments) },
    ];

    if (payload.image) {
      params.push({ name: "image", filename: payload.image.uri, mimeType: payload.image.type });
    }

    return multipartUpload<PostResponse>({
      sessionName: "post-upload",
      path: "/posts",
      token: payload.token,
      description: "Post upload",
      params,
    });
  }, {
    token,
    text,
    image,
    disableComments,
  });
}

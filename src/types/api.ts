export interface ApiError {
  detail?: string;
}

export interface AuthLoginResponse {
  access_token: string;
}

export interface SignupResponse {
  id: string;
  login: string;
  name: string;
  created_at: string;
}

export interface UserProfileResponse {
  id: string;
  nickname: string;
  avatar_url: string | null;
  bio: string | null;
  level: number;
  posts_count: number;
  followers_count: number;
  is_following: boolean;
  created_at: string;
}

export interface PostAuthorResponse {
  id: string;
  name: string;
  avatar_url: string | null;
}

export interface PostResponse {
  id: string;
  text: string;
  medias: string[];
  disable_comments: boolean;
  author: PostAuthorResponse;
  likes_count: number;
  is_liked: boolean;
  created_at: string;
}

import type { User } from "./user";

export interface Post {
  id: string;
  user: User;
  text: string;
  likes: number;
  comments: number;
  liked: boolean;
  timeAgo: string;
  medias?: string[];
}
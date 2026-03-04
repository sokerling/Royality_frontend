import type { User } from "./user";

export interface Post {
  id: number;
  user: User;
  text: string;
  likes: number;
  comments: number;
  liked: boolean;
  timeAgo: string;
}
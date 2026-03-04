export interface User {
  id: number;
  username: string;
  avatarUrl: string;
  usernameColor: string;
  level?: number;
  trophies?: number;
}
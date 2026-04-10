export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  usernameColor: string;
  level?: number;
  trophies?: number;
}
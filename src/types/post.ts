export interface Post {
  id: number;
  username: string;
  avatarUrl: string;
  text: string;
  likes: number;
  comments: number;
  liked: boolean;
}

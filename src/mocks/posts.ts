import type { Post } from "../types/post";
import { mockUsers } from "./users";

export const mockPosts: Post[] = [
  {
    id: 1,
    user: mockUsers[0],
    text: "Только что зашёл в Топ-100 🏆 Мега-найт + Голем = победа!",
    likes: 142,
    comments: 23,
    liked: false,
    timeAgo: "5 мин назад",
  },
  {
    id: 2,
    user: mockUsers[1],
    text: "Кто-нибудь знает как контрить Хог + Файербол? Уже 10 поражений подряд 😭",
    likes: 87,
    comments: 41,
    liked: false,
    timeAgo: "15 мин назад",
  },
  {
    id: 3,
    user: mockUsers[2],
    text: "Новая колода с Эволюцией скелетов — просто имба. Делюсь в колодах 👇",
    likes: 310,
    comments: 58,
    liked: true,
    timeAgo: "1 час назад",
  },
  {
    id: 4,
    user: mockUsers[3],
    text: "Турнир на выходных — кто участвует?",
    likes: 55,
    comments: 19,
    liked: false,
    timeAgo: "3 часа назад",
  },
  {
    id: 5,
    user: mockUsers[4],
    text: "Играю уже 4 года, а всё ещё не могу пройти Арену 14 😅",
    likes: 201,
    comments: 67,
    liked: false,
    timeAgo: "вчера",
  },
  {
    id: 6,
    user: mockUsers[5],
    text: "Рекорд — победа за 47 секунд с колодой из одних заклинаний 💨",
    likes: 489,
    comments: 102,
    liked: false,
    timeAgo: "2 дня назад",
  },
];
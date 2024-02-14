export interface IBoard {
  id: number;
  title: string;
  users: { id: number; username: string }[];
  lists: {
    id: number;
    title: string;
    position: number;
    cards: { id: number; title: string; position: number,  description: string }[];
  }[];
}

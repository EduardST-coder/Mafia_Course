export type UserInfo = {
  id: string;

  nickname: string;

  avatarUrl?: string | null;
};

export type GameRole =
  | 'Civilian'
  | 'Sheriff'
  | 'Mafia'
  | 'Don';

export type PlayerStatus =
  | 'Alive'
  | 'Dead';

export type RoomPlayer = {
  id: string;

  userId: string;

  roomId: string;

  nickname: string;

  isOwner: boolean;

  isReady: boolean;

  seatNumber: number | null;

  status: PlayerStatus | null;

  gameRole: GameRole | null;

  fouls: number;

  user?: UserInfo | null;
};
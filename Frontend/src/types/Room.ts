export interface Room {
  id: string;
  name: string;
  playersCount: number;
  maxPlayers: number;
  isPrivate: boolean;
}

export interface CreateRoomRequest {
  name: string;
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
}

export interface JoinRoomRequest {
  roomId: string;
  password?: string;
}
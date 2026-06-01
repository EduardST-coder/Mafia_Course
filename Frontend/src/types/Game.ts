export interface Player {
  id: string;
  nickname: string;
  role: string;
  isAlive: boolean;
  isMe: boolean;
  isReady: boolean;
  votes?: number;
}

export interface GameMessage {
  sender: string;
  text: string;
  isSystem: boolean;
  timestamp: string;
}

export interface GameState {
  phase: string;
  players: Player[];
  winner?: string;
}
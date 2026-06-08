export const GameRole = {
  Civilian: 'Civilian',
  Sheriff: 'Sheriff',
  Don: 'Don',
  Mafia: 'Mafia',
} as const;

export type GameRole = typeof GameRole[keyof typeof GameRole];

export const GamePhase = {
  Waiting: 'Waiting',
  Night0: 'Night0',
  Night: 'Night',
  Day: 'Day',
  Voting: 'Voting',
  Revote: 'Revote',
  BestMove: 'BestMove',
  Farewell: 'Farewell',
  Ended: 'Ended',
} as const;

export type GamePhase = typeof GamePhase[keyof typeof GamePhase];

export const RoomStatus = {
  Waiting: 'Waiting',
  InProgress: 'InProgress',
  Finished: 'Finished',
} as const;

export type RoomStatus = typeof RoomStatus[keyof typeof RoomStatus];

export const PlayerStatus = {
  Alive: 'Alive',
  Dead: 'Dead',
  Eliminated: 'Eliminated',
} as const;

export type PlayerStatus = typeof PlayerStatus[keyof typeof PlayerStatus];

export interface User {
  id: string;
  nickname: string;
  email: string;
  avatarUrl?: string;
  rating: number;
  role: string;
}

export interface RoomPlayer {
  id: string;
  userId: string;
  roomId: string;
  user: User;
  seatNumber: number;
  gameRole?: GameRole;
  status: PlayerStatus;
  isOwner: boolean;
  fouls: number;
  isMuted: boolean;
  hasVoted: boolean;
  voteTargetSeat?: number;
  isReady: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderSeat: number;
  senderNickname: string;
  text: string;
  timestamp: string;
  isDeadChat: boolean;
  isSystem: boolean;
}

export interface GameState {
  roomId: string;
  phase: GamePhase;
  round: number;
  currentSpeakerSeat: number;
  timeRemaining: number;
  players: RoomPlayer[];
  lastKilledSeat?: number;
  votes: Vote[];
  nominatedSeats: number[];
  revoteNominatedSeats: number[];
  isHost: boolean;
  myPlayer: RoomPlayer;
}

export interface Vote {
  id: string;
  roomId: string;
  round: number;
  voterSeat: number;
  targetSeat: number;
  isRevote: boolean;
}

export interface MafiaKillResult {
  success: boolean;
  targetSeat?: number;
  message: string;
}

export interface SheriffCheckResult {
  targetSeat: number;
  result: 'Red' | 'Black';
}

export interface DonCheckResult {
  targetSeat: number;
  isSheriff: boolean;
}

export interface BestMoveRequest {
  suspectSeats: number[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nickname: string;
  email: string;
  password: string;
}
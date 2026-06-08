// Frontend/src/hooks/useGameHub.ts
import { useEffect, useState, useCallback } from 'react';
import { signalRService } from '../services/signalRService';
import type { 
  RoomPlayer, 
  ChatMessage, 
  GamePhase, 
  MafiaKillResult, 
  SheriffCheckResult, 
  DonCheckResult 
} from '../types';

interface UseGameHubProps {
  roomId: string;
}

interface GameStatePayload {
  phase: GamePhase;
  round: number;
  timeRemaining: number;
  currentSpeakerSeat: number | null;
  nominatedSeats?: number[];
  revoteNominatedSeats?: number[];
  lastKilledSeat?: number;
  mafiaKillResult?: MafiaKillResult;
  sheriffCheckResult?: SheriffCheckResult;
  donCheckResult?: DonCheckResult;
  players: RoomPlayer[];
  myUserId?: string;
}

export const useGameHub = ({ roomId }: UseGameHubProps) => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [phase, setPhase] = useState<GamePhase>('Waiting');
  const [myRole, setMyRole] = useState<string>('');
  const [isAlive, setIsAlive] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentSpeakerSeat, setCurrentSpeakerSeat] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [nominatedSeats, setNominatedSeats] = useState<number[]>([]);
  const [revoteNominatedSeats, setRevoteNominatedSeats] = useState<number[]>([]);
  const [lastKilledSeat, setLastKilledSeat] = useState<number | undefined>();
  const [mafiaKillResult, setMafiaKillResult] = useState<MafiaKillResult | null>(null);
  const [sheriffCheckResult, setSheriffCheckResult] = useState<SheriffCheckResult | null>(null);
  const [donCheckResult, setDonCheckResult] = useState<DonCheckResult | null>(null);
  const [myPlayer, setMyPlayer] = useState<RoomPlayer | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [mafiaPlayers, setMafiaPlayers] = useState<RoomPlayer[]>([]);
  const [isMafia, setIsMafia] = useState(false);
  const [isSheriff, setIsSheriff] = useState(false);
  const [isDon, setIsDon] = useState(false);

  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    const connect = async () => {
      try {
        await signalRService.connect('/hubs/game', token);
        setConnected(true);

        signalRService.on('ReceiveMessage', (msg: ChatMessage) => {
          setMessages(prev => [...prev, msg]);
        });

        signalRService.on('GameStateUpdated', (state: GameStatePayload) => {
          setPhase(state.phase);
          setRound(state.round);
          setTimeRemaining(state.timeRemaining);
          setCurrentSpeakerSeat(state.currentSpeakerSeat);
          setNominatedSeats(state.nominatedSeats || []);
          setRevoteNominatedSeats(state.revoteNominatedSeats || []);
          setLastKilledSeat(state.lastKilledSeat);
          setMafiaKillResult(state.mafiaKillResult || null);
          setSheriffCheckResult(state.sheriffCheckResult || null);
          setDonCheckResult(state.donCheckResult || null);
          
          const statePlayers: RoomPlayer[] = state.players || [];
          setPlayers(statePlayers);
          
          const me = statePlayers.find((p: RoomPlayer) => p.userId === state.myUserId);
          if (me) {
            setMyPlayer(me);
            setMyRole(me.gameRole || '');
            setIsAlive(me.status === 'Alive');
            setIsHost(me.isOwner);
            setIsMafia(me.gameRole === 'Mafia' || me.gameRole === 'Don');
            setIsSheriff(me.gameRole === 'Sheriff');
            setIsDon(me.gameRole === 'Don');
          }
          
          setMafiaPlayers(statePlayers.filter((p: RoomPlayer) => p.gameRole === 'Mafia' || p.gameRole === 'Don'));
        });

        signalRService.on('PlayerJoined', (player: RoomPlayer) => {
          setPlayers(prev => [...prev.filter(p => p.id !== player.id), player]);
        });

        signalRService.on('PlayerLeft', (playerId: string) => {
          setPlayers(prev => prev.filter(p => p.id !== playerId));
        });

        signalRService.on('PhaseChanged', (newPhase: GamePhase) => {
          setPhase(newPhase);
        });

        signalRService.on('YouDied', () => {
          setIsAlive(false);
        });

        signalRService.on('GameStarted', () => {
          setPhase('Night0');
        });

        signalRService.on('GameEnded', (winnerTeam: string) => {
          setPhase('Ended');
          setWinner(winnerTeam);
        });

        await signalRService.joinRoom(roomId);
      } catch (err) {
        console.error('SignalR connection failed:', err);
      }
    };

    connect();

    return () => {
      signalRService.disconnect();
    };
  }, [roomId, token]);

  const sendMessage = useCallback((text: string, isDeadChat = false) => {
    signalRService.connection?.invoke('SendMessage', roomId, text, isDeadChat);
  }, [roomId]);

  const vote = useCallback((targetSeat: number) => {
    signalRService.connection?.invoke('Vote', roomId, targetSeat);
  }, [roomId]);

  const revote = useCallback((targetSeat: number) => {
    signalRService.connection?.invoke('Revote', roomId, targetSeat);
  }, [roomId]);

  const roleAction = useCallback((action: string, targetSeat: number) => {
    signalRService.connection?.invoke('RoleAction', roomId, action, targetSeat);
  }, [roomId]);

  const endSpeech = useCallback(() => {
    signalRService.connection?.invoke('EndSpeech', roomId);
  }, [roomId]);

  const startGame = useCallback(() => {
    signalRService.connection?.invoke('StartGame', roomId);
  }, [roomId]);

  const nextPhase = useCallback(() => {
    signalRService.connection?.invoke('NextPhase', roomId);
  }, [roomId]);

  const giveFoul = useCallback((targetSeat: number) => {
    signalRService.connection?.invoke('GiveFoul', roomId, targetSeat);
  }, [roomId]);

  const eliminatePlayer = useCallback((targetSeat: number) => {
    signalRService.connection?.invoke('EliminatePlayer', roomId, targetSeat);
  }, [roomId]);

  const setSpeaker = useCallback((seat: number) => {
    signalRService.connection?.invoke('SetSpeaker', roomId, seat);
  }, [roomId]);

  const nominatePlayer = useCallback((targetSeat: number) => {
    signalRService.connection?.invoke('NominatePlayer', roomId, targetSeat);
  }, [roomId]);

  const skipSpeaker = useCallback(() => {
    signalRService.connection?.invoke('SkipSpeaker', roomId);
  }, [roomId]);

  const resetVotes = useCallback(() => {
    signalRService.connection?.invoke('ResetVotes', roomId);
  }, [roomId]);

  const ready = useCallback(() => {
    signalRService.connection?.invoke('PlayerReady', roomId);
  }, [roomId]);

  return {
    connected,
    messages,
    players,
    phase,
    myRole,
    isAlive,
    winner,
    timeRemaining,
    currentSpeakerSeat,
    round,
    nominatedSeats,
    revoteNominatedSeats,
    lastKilledSeat,
    mafiaKillResult,
    sheriffCheckResult,
    donCheckResult,
    myPlayer,
    isHost,
    mafiaPlayers,
    isMafia,
    isSheriff,
    isDon,
    sendMessage,
    vote,
    revote,
    roleAction,
    endSpeech,
    startGame,
    nextPhase,
    giveFoul,
    eliminatePlayer,
    setSpeaker,
    nominatePlayer,
    skipSpeaker,
    resetVotes,
    ready,
  };
};
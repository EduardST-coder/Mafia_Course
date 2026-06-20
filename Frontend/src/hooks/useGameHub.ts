// Frontend/src/hooks/useGameHub.ts
import { useEffect, useState, useCallback, useRef } from 'react';
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
  
  // Guard від подвійного монтажу Strict Mode
  const connectingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const connect = async () => {
      // Guard: вже підключаємось або вже підключено
      if (connectingRef.current) return;
      if (signalRService.state === 'Connected') {
        setConnected(true);
        return;
      }

      connectingRef.current = true;

      try {
        await signalRService.connect('/hubs/game', token);
        
        // Перевірка: компонент ще монтований?
        if (!mountedRef.current) {
          signalRService.disconnect();
          return;
        }

        setConnected(true);

        // Події — викликаємо через функцію, щоб уникнути stale closure
        const handleMessage = (msg: ChatMessage) => {
          if (!mountedRef.current) return;
          setMessages(prev => [...prev, msg]);
        };

        const handleGameState = (state: GameStatePayload) => {
          if (!mountedRef.current) return;
          
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
        };

        const handlePlayerJoined = (player: RoomPlayer) => {
          if (!mountedRef.current) return;
          setPlayers(prev => [...prev.filter(p => p.id !== player.id), player]);
        };

        const handlePlayerLeft = (playerId: string) => {
          if (!mountedRef.current) return;
          setPlayers(prev => prev.filter(p => p.id !== playerId));
        };

        const handlePhaseChanged = (newPhase: GamePhase) => {
          if (!mountedRef.current) return;
          setPhase(newPhase);
        };

        const handleYouDied = () => {
          if (!mountedRef.current) return;
          setIsAlive(false);
        };

        const handleGameStarted = () => {
          if (!mountedRef.current) return;
          setPhase('Night0');
        };

        const handleGameEnded = (winnerTeam: string) => {
          if (!mountedRef.current) return;
          setPhase('Ended');
          setWinner(winnerTeam);
        };

        // Реєструємо обробники
        signalRService.on('ReceiveMessage', handleMessage);
        signalRService.on('GameStateUpdated', handleGameState);
        signalRService.on('PlayerJoined', handlePlayerJoined);
        signalRService.on('PlayerLeft', handlePlayerLeft);
        signalRService.on('PhaseChanged', handlePhaseChanged);
        signalRService.on('YouDied', handleYouDied);
        signalRService.on('GameStarted', handleGameStarted);
        signalRService.on('GameEnded', handleGameEnded);

        await signalRService.joinRoom(roomId);
      } catch (err) {
        if (mountedRef.current) {
          console.error('SignalR connection failed:', err);
        }
      } finally {
        connectingRef.current = false;
      }
    };

    connect();

    return () => {
      mountedRef.current = false;
      // НЕ відключаємо SignalR тут — хаб може використовуватись іншими компонентами
      // Відключення робимо при виході з кімнати
    };
  }, [roomId, token]);

  // Дія для виходу з кімнати — відключає SignalR
  const disconnect = useCallback(() => {
    signalRService.disconnect();
    setConnected(false);
  }, []);

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
    disconnect,  // ← НОВЕ: для виходу з кімнати
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
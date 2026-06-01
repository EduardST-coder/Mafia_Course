import { useEffect, useState, useCallback } from 'react';
import { signalRService } from '../services/signalRService';
import type { Player, GameMessage } from '../types/Game';

interface UseGameHubReturn {
  connected: boolean;
  messages: GameMessage[];
  gameState: Record<string, unknown> | null;
  players: Player[];
  phase: string;
  myRole: string;
  isAlive: boolean;
  winner: string | null;
  sendMessage: (text: string) => void;
  vote: (targetId: string) => void;
  roleAction: (action: string, targetId: string) => void;
  ready: () => void;
}

export const useGameHub = (roomId: string): UseGameHubReturn => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const [gameState, setGameState] = useState<Record<string, unknown> | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [phase, setPhase] = useState('waiting');
  const [myRole, setMyRole] = useState('');
  const [isAlive, setIsAlive] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);

  const token = localStorage.getItem('token') || '';

  const sendMessage = useCallback((text: string) => {
    signalRService.sendMessage(roomId, text);
  }, [roomId]);

  const vote = useCallback((targetId: string) => {
    signalRService.vote(roomId, targetId);
  }, [roomId]);

  const roleAction = useCallback((action: string, targetId: string) => {
    signalRService.roleAction(roomId, action, targetId);
  }, [roomId]);

  const ready = useCallback(() => {
    signalRService.ready(roomId);
  }, [roomId]);

  useEffect(() => {
    const connect = async () => {
      try {
        await signalRService.connect('/hubs/game', token);
        setConnected(true);

        signalRService.on<GameMessage>('ReceiveMessage', (msg) => {
          setMessages(prev => [...prev, msg]);
        });

        signalRService.on<Record<string, unknown>>('GameStateUpdated', (state) => {
          setGameState(state);
          setPhase(state.phase as string);
          const statePlayers = state.players as Player[];
          setPlayers(statePlayers);
          const me = statePlayers.find(p => p.isMe);
          if (me) {
            setMyRole(me.role);
            setIsAlive(me.isAlive);
          }
        });

        signalRService.on<Player>('PlayerJoined', (player) => {
          setPlayers(prev => [...prev.filter(p => p.id !== player.id), player]);
        });

        signalRService.on<string>('PlayerLeft', (playerId) => {
          setPlayers(prev => prev.filter(p => p.id !== playerId));
        });

        signalRService.on<string>('PhaseChanged', (newPhase) => {
          setPhase(newPhase);
        });

        signalRService.on<unknown>('YouDied', () => {
          setIsAlive(false);
        });

        signalRService.on<unknown>('GameStarted', () => {
          setPhase('night');
        });

        signalRService.on<string>('GameEnded', (winnerTeam) => {
          setPhase('ended');
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

  return {
    connected,
    messages,
    gameState,
    players,
    phase,
    myRole,
    isAlive,
    winner,
    sendMessage,
    vote,
    roleAction,
    ready,
  };
};
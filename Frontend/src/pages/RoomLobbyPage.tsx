import { useEffect, useState, useRef, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getRoomPlayers,
  chooseSeat,
  joinRoom,
  leaveRoom,
} from "../services/roomService";
import { useGameHub } from "../hooks/useGameHub";
import { useWebRTC } from "../hooks/useWebRTC";
import { AuthContext } from "../context/AuthContext";
import type { RoomPlayer } from "../types";
import { Night0Phase } from "../components/game/Night0Phase";
import { DayPhase } from "../components/game/DayPhase";
import { NightPhase } from "../components/game/NightPhase";
import { HostPanel } from "../components/game/HostPanel";
import "../styles/rooms.css";



const ROLE_ICONS: Record<string, { icon: string; color: string }> = {
  Civilian: { icon: '👤', color: '#e53e3e' },
  Sheriff: { icon: '🔍', color: '#38a169' },
  Mafia: { icon: '🔪', color: '#1a202c' },
  Don: { icon: '👑', color: '#1a202c' },
};

type GamePhase = 'Waiting' | 'Night0' | 'Day' | 'Night' | 'Voting' | 'Ended';

interface MafiaKillResult {
  success: boolean;
  message: string;
  targetSeat?: number;
}

interface SheriffCheckResult {
  targetSeat: number;
  result: 'Red' | 'Black';
}

interface DonCheckResult {
  targetSeat: number;
  isSheriff: boolean;
}

interface RoomPlayersApiResponse {
  hostId?: string;
  hostName?: string;
  players: RoomPlayer[];
}

export default function RoomLobbyPage() {
  const [showHostPanel, setShowHostPanel] = useState(false);
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const joinedRef = useRef(false);

useEffect(() => {
  if (!roomId || !user || joinedRef.current) {
    return;
  }

  joinedRef.current = true;

  const joinCurrentRoom = async () => {
    try {
      const result = await joinRoom(roomId);

      console.log("Joined room:", result);
    } catch (error) {
      console.error("Join room failed:", error);
    }
  };

  joinCurrentRoom();
}, [roomId, user]);

  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [hostName, setHostName] = useState<string>("Невідомий");
  const [hostId, setHostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [gamePhase, setGamePhase] = useState<GamePhase>('Waiting');
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState<number | null>(null);
  const [speakerTimeLeft, setSpeakerTimeLeft] = useState(60);
  const [nominatedSeats, setNominatedSeats] = useState<number[]>([]);
  
  const [mafiaKillResult, setMafiaKillResult] = useState<MafiaKillResult | null>(null);
  const [sheriffCheckResult, setSheriffCheckResult] = useState<SheriffCheckResult | null>(null);
  const [donCheckResult, setDonCheckResult] = useState<DonCheckResult | null>(null);

  const { connected, phase, ready } = useGameHub({ roomId: roomId || '' });
  const token = localStorage.getItem('token') || '';

const readyCount = players.filter(
  p => p.isReady
).length;

const isHost =
  hostId !== null &&
  user?.id === hostId;

const webrtc = useWebRTC({
  roomId: roomId || '',
  token,
  userId: user?.id || null,
  isHost
});

const {
  localStream,
  remoteStreams,
  isCameraOn,
  isMicOn,
  toggleCamera,
  toggleMic
} = webrtc;
  const handleNextPhase = useCallback(() => {
    setGamePhase(prev => {
      switch (prev) {
        case 'Night0': return 'Day';
        case 'Day': return 'Night';
        case 'Night': return 'Day';
        default: return prev;
      }
    });
    setPhaseTimer(0);
    setActiveSpeaker(null);
    setNominatedSeats([]);
    setMafiaKillResult(null);
    setSheriffCheckResult(null);
    setDonCheckResult(null);
  }, []);

  const handleNextSpeaker = useCallback(() => {
    const alivePlayers = players
      .filter(p => p.seatNumber && p.seatNumber > 0 && p.status !== 'Dead' && p.status !== 'Eliminated')
      .sort((a, b) => (a.seatNumber || 0) - (b.seatNumber || 0));
    
    if (activeSpeaker === null) {
      setActiveSpeaker(alivePlayers[0]?.seatNumber || null);
    } else {
      const currentIndex = alivePlayers.findIndex(p => p.seatNumber === activeSpeaker);
      const nextPlayer = alivePlayers[currentIndex + 1];
      if (nextPlayer) {
        setActiveSpeaker(nextPlayer.seatNumber || null);
      } else {
        setActiveSpeaker(null);
        setGamePhase('Voting');
      }
    }
    setSpeakerTimeLeft(60);
  }, [activeSpeaker, players]);

  const handleEndSpeech = useCallback(() => {
    handleNextSpeaker();
  }, [handleNextSpeaker]);

  const handleSetSpeaker = useCallback((seat: number) => {
    setActiveSpeaker(seat);
    setSpeakerTimeLeft(60);
  }, []);

  const handleSkipSpeaker = useCallback(() => {
    handleNextSpeaker();
  }, [handleNextSpeaker]);

  const handleNominate = useCallback((seat: number) => {
    setNominatedSeats(prev => 
      prev.includes(seat) ? prev : [...prev, seat]
    );
  }, []);

  const handleResetVotes = useCallback(() => {
    setNominatedSeats([]);
  }, []);

  const handleGiveFoul = useCallback((playerId: string) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, fouls: (p.fouls || 0) + 1 } : p
    ));
  }, []);

  const handleEliminate = useCallback((playerId: string) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, status: 'Eliminated' } : p
    ));
  }, []);

  const handleNightAction = useCallback((targetSeat: number) => {
    const myPlayerRole = players.find(p => p.userId === user?.id)?.gameRole;
    
    if (myPlayerRole === 'Sheriff') {
      const target = players.find(p => p.seatNumber === targetSeat);
      setSheriffCheckResult({
        targetSeat,
        result: (target?.gameRole === 'Mafia' || target?.gameRole === 'Don') ? 'Black' : 'Red'
      });
    } else if (myPlayerRole === 'Don') {
      const target = players.find(p => p.seatNumber === targetSeat);
      setDonCheckResult({
        targetSeat,
        isSheriff: target?.gameRole === 'Sheriff'
      });
    }
  }, [players, user?.id]);

  const handleConfirmMafiaKill = useCallback((targetSeats: number[]) => {
    setMafiaKillResult({
      success: true,
      message: `Мафія обрала жертв: ${targetSeats.join(', ')}`,
      targetSeat: targetSeats[0]
    });
  }, []);

  useEffect(() => {
    if (phase && phase !== 'Waiting') {
      setGamePhase(phase as GamePhase);
    }
  }, [phase]);

  useEffect(() => {
    if (gamePhase === 'Waiting' || gamePhase === 'Ended') return;
    
    const timer = setInterval(() => {
      setPhaseTimer(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gamePhase]);

  useEffect(() => {
    if (gamePhase !== 'Day' || activeSpeaker === null) return;
    
    setSpeakerTimeLeft(60);
    const timer = setInterval(() => {
      setSpeakerTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNextSpeaker();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [activeSpeaker, gamePhase, handleNextSpeaker]);

  const loadPlayers = async (currentRoomId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getRoomPlayers(currentRoomId);
      
      let playerList: RoomPlayer[] = [];
      let apiHostName: string | undefined;
      let apiHostId: string | undefined;
      
      if (Array.isArray(result)) {
  playerList = result;
} else if (result && typeof result === 'object') {
  const apiResponse = result as RoomPlayersApiResponse;

  if (Array.isArray(apiResponse.players)) {
    // Викидаємо ведучого зі списку гравців
    playerList = apiResponse.players.filter(
      player => player.userId !== apiResponse.hostId
    );
  }

  apiHostName = apiResponse.hostName;
  apiHostId = apiResponse.hostId;
} else {
  console.error('Unexpected API response format:', result);
  setError('Невірний формат відповіді сервера');
}
      
      setPlayers(playerList);
      setHostId(apiHostId ?? null);
      
      if (apiHostName) {
        setHostName(apiHostName);
      } else {
        const owner = playerList.find(p => p.isOwner);
        setHostName(owner?.user?.nickname || "Невідомий");
      }
    } catch (err) {
      console.error('loadPlayers error:', err);
      setError('Не вдалося завантажити гравців');
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChooseSeat = async (seatNum: number) => {
  // Ведучий не може бути гравцем
  if (isHost) {
    alert("🎤 Ведучий не може займати місце гравця");
    return;
  }

  if (!roomId) return;

  try {
    await chooseSeat(roomId, seatNum);

    // Даємо серверу оновити стан
    await new Promise((resolve) => setTimeout(resolve, 300));

    await loadPlayers(roomId);
  } catch (error: unknown) {
    const err = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
    };

    alert(
      `❌ Не вдалося зайняти місце: ${
        err.response?.data?.message || "Помилка"
      }`
    );
  }
};

  const handleStartGame = () => {
    ready?.();
    setGamePhase('Night0');
    setPhaseTimer(0);
  };
  
  const handleLeave = async () => {
  try {
    if (roomId && user?.id) {
      await leaveRoom(
        roomId,
        user.id
      );
    }
  } catch (error) {
    console.error(
      "Leave room failed:",
      error
    );
  }

  navigate('/');
};

 useEffect(() => {
  if (roomId) {
    loadPlayers(roomId);
  }

}, [roomId]);
  useEffect(() => {
    if (phase && phase !== 'Waiting' && phase !== 'Ended' && roomId) {
      navigate(`/game/${roomId}`);
    }
  }, [phase, roomId, navigate]);

  useEffect(() => {
    document.body.classList.add('hide-navbar');
    return () => document.body.classList.remove('hide-navbar');
  }, []);

  const getPlayerBySeat = (seatNum: number) => 
    players.find((p) => p.seatNumber === seatNum && p.seatNumber > 0);
  const myPlayer = players.find((p) => p.userId === user?.id);

  const mafiaPlayers = players.filter(p => p.gameRole === 'Mafia' || p.gameRole === 'Don');
  const isMafia = myPlayer?.gameRole === 'Mafia' || myPlayer?.gameRole === 'Don';
  const isSheriff = myPlayer?.gameRole === 'Sheriff';
  const isDon = myPlayer?.gameRole === 'Don';
  const mySeat = myPlayer?.seatNumber || 0;
  const isAlive = myPlayer?.status === 'Alive' || !myPlayer?.status;
  const isMyTurn = activeSpeaker === mySeat && gamePhase === 'Day';

  useEffect(() => {
    if (!myPlayer) return;
    
    const isMafiaRole = myPlayer.gameRole === 'Mafia' || myPlayer.gameRole === 'Don';
    
    switch (gamePhase) {
      case 'Night0':
        if (isMafiaRole) {
          if (!isCameraOn) toggleCamera();
          if (!isMicOn) toggleMic();
        } else {
          if (isCameraOn) toggleCamera();
          if (isMicOn) toggleMic();
        }
        break;
        
      case 'Night':
        if (isMafiaRole) {
          if (!isCameraOn) toggleCamera();
          if (!isMicOn) toggleMic();
        } else {
          if (isCameraOn) toggleCamera();
          if (isMicOn) toggleMic();
        }
        break;
        
      case 'Day':
      case 'Voting':
        if (!isCameraOn) toggleCamera();
        if (!isMicOn) toggleMic();
        break;
    }
  }, [gamePhase, myPlayer, myPlayer?.gameRole, isCameraOn, isMicOn, toggleCamera, toggleMic]);

  const getStreamForSeat = (
  player: RoomPlayer | undefined
): MediaStream | null => {
  if (!player) return null;

  const isMySeat = player.userId === user?.id;

  // 🎤 Ведучий бачить усіх завжди
  if (isHost) {
    return isMySeat
      ? localStream
      : remoteStreams.get(player.userId) || null;
  }

  // Очікування
  if (gamePhase === 'Waiting' || !gamePhase) {
    return isMySeat
      ? localStream
      : remoteStreams.get(player.userId) || null;
  }

  // Ніч
  if (gamePhase === 'Night0' || gamePhase === 'Night') {
    if (
      myPlayer?.gameRole === 'Don' ||
      myPlayer?.gameRole === 'Mafia'
    ) {
      if (
        player.gameRole === 'Don' ||
        player.gameRole === 'Mafia'
      ) {
        return isMySeat
          ? localStream
          : remoteStreams.get(player.userId) || null;
      }
    }

    return null;
  }

  // День і голосування
  if (
    gamePhase === 'Day' ||
    gamePhase === 'Voting'
  ) {
    if (
      player.status === 'Dead' ||
      player.status === 'Eliminated'
    ) {
      return null;
    }

    return isMySeat
      ? localStream
      : remoteStreams.get(player.userId) || null;
  }

  return isMySeat
    ? localStream
    : remoteStreams.get(player.userId) || null;
};

 const renderCamera = (seatNum: number) => {
  const player = getPlayerBySeat(seatNum);
  const isMySeat = player?.userId === user?.id;
  const stream = getStreamForSeat(player);
  const hasStream = !!stream && stream.active;
  const isSpeaking = activeSpeaker === seatNum && gamePhase === 'Day';

  // Порожнє місце
  if (!player) {
    return (
      <div
        className={`player-camera empty pos-${seatNum} ${
          isHost ? 'disabled-seat' : ''
        }`}
        onClick={() => {
          if (!isHost) {
            handleChooseSeat(seatNum);
          }
        }}
      >
        <div className="seat-number">{seatNum}</div>

        <div className="camera-avatar">
          <div className="avatar-placeholder">
            {isHost ? '🎤' : '+'}
          </div>
        </div>

        <div className="camera-info">
          <span className="player-name">
            {isHost ? 'Місце для гравця' : 'Вільне місце'}
          </span>
        </div>
      </div>
    );
  }

  const roleInfo = player.gameRole
    ? ROLE_ICONS[player.gameRole]
    : null;

  const isDead =
    player.status === 'Dead' ||
    player.status === 'Eliminated';

  return (
    <div
      className={`player-camera occupied pos-${seatNum} ${
        isDead ? 'dead' : ''
      } ${isSpeaking ? 'speaking' : ''}`}
    >
      <div className="seat-number">{seatNum}</div>

      {isSpeaking && (
        <div className="speaker-indicator">
          🎤 {speakerTimeLeft}с
        </div>
      )}

      {(isMySeat || isHost) && roleInfo && (
        <div
          className="role-badge"
          style={{ background: roleInfo.color }}
        >
          {roleInfo.icon} {player.gameRole}
        </div>
      )}

      <div className="camera-video">
        {hasStream ? (
          <VideoPlayer
            stream={stream}
            muted={isMySeat}
          />
        ) : (
          <div className="camera-avatar">
            <div
              className="avatar-placeholder"
              style={{
                background: player.isOwner
                  ? '#ffd700'
                  : '#4a5568',
                filter: isDead
                  ? 'grayscale(100%)'
                  : 'none',
              }}
            >
              {player.user?.nickname
                ?.charAt(0)
                ?.toUpperCase() || '?'}

              {isDead && '💀'}
            </div>
          </div>
        )}
      </div>

      <div className="camera-info">
        <span className="player-name">
          {player.user?.nickname || 'Unknown'}
        </span>

        {player.isOwner && (
          <span className="badge host">
            🎤 Ведучий
          </span>
        )}

        {player.isReady && (
          <span className="badge ready">
            ✅ Готовий
          </span>
        )}

        {isDead && (
          <span className="badge dead">
            💀 Мертвий
          </span>
        )}
      </div>

      {isMySeat && (
        <div className="camera-controls">
          <span
            className={`mic-icon ${
              isMicOn ? 'on' : 'off'
            }`}
          >
            🎤
          </span>

          <span
            className={`camera-icon ${
              isCameraOn ? 'on' : 'off'
            }`}
          >
            📷
          </span>
        </div>
      )}
    </div>
  );
};

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && players.length === 0) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Завантаження кімнати...</p>
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  }

  if (error && players.length === 0) {
    return (
      <div className="page-error">
        <p>❌ {error}</p>
        <button onClick={() => roomId && loadPlayers(roomId)}>Спробувати знову</button>
        <button onClick={handleLeave}>← На головну</button>
      </div>
    );
  }

  return (
    <div className="room-lobby">
      {gamePhase !== 'Waiting' && (
        <div className={`phase-banner phase-${gamePhase.toLowerCase()}`}>
          <div className="phase-info">
            <span className="phase-name">
              {gamePhase === 'Night0' && '🌑 Ніч 0 — Знайомство мафії'}
              {gamePhase === 'Night' && '🌙 Ніч'}
              {gamePhase === 'Day' && '☀️ День — Обговорення'}
              {gamePhase === 'Voting' && '🗳️ Голосування'}
            </span>
            <span className="phase-timer">⏱️ {formatTime(phaseTimer)}</span>
          </div>
          {isHost && gamePhase !== 'Voting' && (
            <div className="phase-controls">
              {gamePhase === 'Day' && (
                <button className="phase-btn" onClick={handleNextSpeaker}>
                  {activeSpeaker ? '⏭️ Наступний спікер' : '🎤 Почати коло'}
                </button>
              )}
              <button className="phase-btn next-phase" onClick={handleNextPhase}>
                ⏭️ Наступна фаза
              </button>
            </div>
          )}
        </div>
      )}

      <div className="lobby-header">
        <h2>🎩 Mafia Room</h2>
        <div className="connection-status">
          {connected ? '🟢 Онлайн' : '🔴 Підключення...'}
          <span className="room-id">ID: {roomId?.slice(0, 8)}</span>
        </div>
        <div className="ready-counter">Готові: {readyCount} / {players.length}</div>
        
        {isHost && gamePhase === 'Waiting' && (
          <button 
            onClick={handleStartGame} 
            className="btn-start"
            disabled={players.length < 10}
          >
            🚀 Почати гру {players.length < 10 && `(${players.length}/10)`}
          </button>
        )}
      </div>

      {/* Night0 Phase Overlay */}
      {gamePhase === 'Night0' && (
        <Night0Phase
          myRole={myPlayer?.gameRole || null}
          players={players}
          mafiaPlayers={mafiaPlayers}
          isMafia={isMafia}
        />
      )}

      {/* Day Phase Overlay */}
      {gamePhase === 'Day' && (
        <DayPhase
          players={players}
          currentSpeakerSeat={activeSpeaker}
          mySeat={mySeat}
          isAlive={isAlive}
          onEndSpeech={handleEndSpeech}
          isMyTurn={isMyTurn}
        />
      )}

      {/* Night Phase Overlay */}
      {gamePhase === 'Night' && (
        <NightPhase
          myRole={myPlayer?.gameRole || null}
          players={players}
          mafiaPlayers={mafiaPlayers}
          isMafia={isMafia}
          isSheriff={isSheriff}
          isDon={isDon}
          mafiaKillResult={mafiaKillResult}
          sheriffCheckResult={sheriffCheckResult}
          donCheckResult={donCheckResult}
          onAction={handleNightAction}
          onConfirmMafiaKill={handleConfirmMafiaKill}
        />
      )}

      {/* Host Panel */}
      {/* Host Panel */}
{/* Host Panel */}
{isHost && (
  <>
    <button
      type="button"
      className="host-panel-toggle"
      onClick={() => setShowHostPanel(!showHostPanel)}
    >
      {showHostPanel
        ? "🎤 Сховати панель ведучого"
        : "🎤 Показати панель ведучого"}
    </button>

    {showHostPanel && (
      <div className="host-panel-wrapper">
        <HostPanel
  phase={gamePhase}
  players={players}
  currentSpeakerSeat={activeSpeaker}
  nominatedSeats={nominatedSeats}
  onGiveFoul={handleGiveFoul}
  onEliminate={handleEliminate}
  onSetSpeaker={handleSetSpeaker}
  onNominate={handleNominate}
  onSkipSpeaker={handleSkipSpeaker}
  onNextPhase={handleNextPhase}
  onResetVotes={handleResetVotes}

 onChangePhase={(phase) => {
  console.log('Change phase:', phase);
}}

 onChangeRole={(playerId, role) => {
  setPlayers(prev =>
    prev.map(player =>
      player.id === playerId
        ? {
            ...player,
            gameRole: role,
          }
        : player
    )
  );
}}

onToggleAlive={(playerId) => {
  setPlayers(prev =>
    prev.map(player =>
      player.id === playerId
        ? {
            ...player,
            status:
              player.status === 'Alive'
                ? 'Dead'
                : 'Alive',
          }
        : player
    )
  );
}}
/>
      </div>
    )}
  </>
)}

      <div className="table-container">
        <div className="table-top">
          {renderCamera(10)}
          {renderCamera(1)}
          {renderCamera(2)}
        </div>
        <div className="table-middle">
          <div className="table-left">
            {renderCamera(9)}
            {renderCamera(8)}
          </div>
          <div className="table-center">
            <div className="table-logo">
              <div className="logo-icon">🎩</div>
              <div className="logo-text">MAFIA</div>
              <div className="logo-sub">ONLINE</div>
            </div>
          </div>
          <div className="table-right">
            {renderCamera(3)}
            {renderCamera(4)}
          </div>
        </div>
        <div className="table-bottom">
          {renderCamera(7)}
          {renderCamera(6)}
          {renderCamera(5)}
        </div>
      </div>

      <div className="bottom-panel">
        <button onClick={handleLeave} className="btn-leave">← Вийти</button>
        
        <div className="host-info">
          🎤 Ведучий: <span>{hostName}</span>
        </div>
        
        <div className="panel-controls">
          <button 
            className={`panel-btn ${isMicOn ? 'active' : ''}`} 
            onClick={toggleMic}
          >
            {isMicOn ? '🎤' : '🎤❌'} Мікрофон
          </button>
          <button 
            className={`panel-btn ${isCameraOn ? 'active' : ''}`} 
            onClick={toggleCamera}
          >
            {isCameraOn ? '📹' : '📹❌'} Камера
          </button>
        </div>
        
        <div className="players-count">👥 {players.length} / 10</div>
      </div>
    </div>
  );
}

function VideoPlayer({
  stream,
  muted = false,
}: {
  stream: MediaStream | null;
  muted?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !stream) {
      return;
    }

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    const playPromise = video.play();

    if (playPromise) {
      playPromise.catch((error) => {
        console.warn(
          'Video play interrupted:',
          error
        );
      });
    }
  }, [stream]);

  if (!stream) {
    return (
      <div className="camera-avatar">
        <div className="avatar-placeholder">
          ?
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      muted={muted}
      playsInline
      className="video-stream"
    />
  );
}
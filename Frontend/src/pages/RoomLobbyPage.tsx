import { useEffect, useState, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoomPlayers, chooseSeat } from "../services/roomService";
import { useGameHub } from "../hooks/useGameHub";
import { useWebRTC } from "../hooks/useWebRTC";
import { AuthContext } from "../context/AuthContext";
import type { RoomPlayer } from "../types";
import "../styles/rooms.css";

// Ролі для відображення
const ROLE_ICONS: Record<string, { icon: string; color: string }> = {
  Civilian: { icon: '👤', color: '#e53e3e' },
  Sheriff: { icon: '🔍', color: '#38a169' },
  Mafia: { icon: '🔪', color: '#1a202c' },
  Don: { icon: '👑', color: '#1a202c' },
};

export default function RoomLobbyPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { connected, phase, ready } = useGameHub({ roomId: roomId || '' });
  
  const webrtc = useWebRTC({ roomId: roomId || '', token: '', userId: user?.id || null });
  const { localStream, remoteStreams, isCameraOn, isMicOn, toggleCamera, toggleMic } = webrtc;

  // Завантаження гравців
  const loadPlayers = async (currentRoomId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getRoomPlayers(currentRoomId);
      console.log('API getRoomPlayers result:', result);
      
      let playerList: RoomPlayer[] = [];
      if (Array.isArray(result)) {
        playerList = result;
      } else if (result && Array.isArray(result.players)) {
        playerList = result.players;
      } else {
        console.error('Unexpected API response format:', result);
        setError('Невірний формат відповіді сервера');
      }
      
      setPlayers(playerList);
    } catch (err) {
      console.error('loadPlayers error:', err);
      setError('Не вдалося завантажити гравців');
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChooseSeat = async (seatNum: number) => {
    if (!roomId) return;
    try {
      await chooseSeat(roomId, seatNum);
      await new Promise(r => setTimeout(r, 300));
      await loadPlayers(roomId);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(`❌ Не вдалося зайняти місце: ${err.response?.data?.message || 'Помилка'}`);
    }
  };

  const handleStartGame = () => ready?.();
  const handleLeave = () => navigate('/');

  useEffect(() => {
    if (roomId) loadPlayers(roomId);
    
    const interval = setInterval(() => {
      if (roomId && phase === 'Waiting') loadPlayers(roomId);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [roomId, phase]);

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
  const isHost = myPlayer?.isOwner || false;
  const hostPlayer = players.find((p) => p.isOwner);
  const readyCount = players.filter(p => p.isReady).length;

  // ВИЗНАЧАЄМО СТРІМ ДЛЯ КАМЕРИ
  const getStreamForSeat = (player: RoomPlayer | undefined): MediaStream | null => {
    if (!player) return null;
    
    const isMySeat = player.userId === user?.id;
    
    if (phase === 'Waiting' || !phase) {
      return isMySeat ? localStream : remoteStreams.get(player.userId) || null;
    }
    
    // НІЧ: тільки Дон і Мафія бачать одне одного
    if (phase === 'Night') {
      if (myPlayer?.gameRole === 'Don' || myPlayer?.gameRole === 'Mafia') {
        if (player.gameRole === 'Don' || player.gameRole === 'Mafia') {
          return isMySeat ? localStream : remoteStreams.get(player.userId) || null;
        }
        return null;
      }
      return null;
    }
    
    // ДЕНЬ: всі бачать всіх (крім мертвих)
    if (phase === 'Day') {
      if (player.status === 'Dead' || player.status === 'Eliminated') return null;
      return isMySeat ? localStream : remoteStreams.get(player.userId) || null;
    }
    
    return isMySeat ? localStream : remoteStreams.get(player.userId) || null;
  };

  const renderCamera = (seatNum: number) => {
    const player = getPlayerBySeat(seatNum);
    const isMySeat = player?.userId === user?.id;
    const stream = getStreamForSeat(player);
    const hasStream = !!stream && stream.active;

    if (!player) {
      return (
        <div 
          className={`player-camera empty pos-${seatNum}`}
          onClick={() => handleChooseSeat(seatNum)}
        >
          <div className="seat-number">{seatNum}</div>
          <div className="camera-avatar">
            <div className="avatar-placeholder">+</div>
          </div>
          <div className="camera-info">
            <span className="player-name">Вільне місце</span>
          </div>
        </div>
      );
    }

    const roleInfo = player.gameRole ? ROLE_ICONS[player.gameRole] : null;
    const isDead = player.status === 'Dead' || player.status === 'Eliminated';
    
    return (
      <div className={`player-camera occupied pos-${seatNum} ${isDead ? 'dead' : ''}`}>
        <div className="seat-number">{seatNum}</div>
        
        {(isMySeat || isHost) && roleInfo && (
          <div className="role-badge" style={{ background: roleInfo.color }}>
            {roleInfo.icon} {player.gameRole}
          </div>
        )}
        
        <div className="camera-video">
          {hasStream ? (
            <VideoPlayer stream={stream} muted={isMySeat} />
          ) : (
            <div className="camera-avatar">
              <div className="avatar-placeholder" style={{ 
                background: player.isOwner ? '#ffd700' : '#4a5568',
                filter: isDead ? 'grayscale(100%)' : 'none'
              }}>
                {player.user?.nickname?.charAt(0)?.toUpperCase() || '?'}
                {isDead && '💀'}
              </div>
            </div>
          )}
        </div>

        <div className="camera-info">
          <span className="player-name">{player.user?.nickname || 'Unknown'}</span>
          {player.isOwner && <span className="badge host">🎤 Ведучий</span>}
          {player.isReady && <span className="badge ready">✅ Готовий</span>}
          {isDead && <span className="badge dead">💀 Мертвий</span>}
        </div>
        
        {isMySeat && (
          <div className="camera-controls">
            <span className={`mic-icon ${isMicOn ? 'on' : 'off'}`}>🎤</span>
            <span className={`camera-icon ${isCameraOn ? 'on' : 'off'}`}>📷</span>
          </div>
        )}
      </div>
    );
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
      <div className="lobby-header">
        <h2>🎩 Mafia Room</h2>
        <div className="connection-status">
          {connected ? '🟢 Онлайн' : '🔴 Підключення...'}
          <span className="room-id">ID: {roomId?.slice(0, 8)}</span>
        </div>
        <div className="ready-counter">Готові: {readyCount} / {players.length}</div>
        
        {isHost && (
          <button 
            onClick={handleStartGame} 
            className="btn-start"
            disabled={players.length < 10}
          >
            🚀 Почати гру {players.length < 10 && `(${players.length}/10)`}
          </button>
        )}
      </div>

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
          🎤 Ведучий: <span>{hostPlayer?.user?.nickname || 'Невідомий'}</span>
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

function VideoPlayer({ stream, muted = false }: { stream: MediaStream | null; muted?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream]);

  if (!stream) return (
    <div className="camera-avatar">
      <div className="avatar-placeholder">?</div>
    </div>
  );

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
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoomPlayers, chooseSeat } from "../services/roomService";
import { useGameHub } from "../hooks/useGameHub";
import { useWebRTC } from "../hooks/useWebRTC";
import type { RoomPlayer } from "../types/RoomPlayer";
import "../styles/rooms.css";

export default function RoomLobbyPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);

  const { connected, phase, ready } = useGameHub(roomId || '');
  const { 
    localStream, 
    isCameraOn, 
    isMicOn, 
    toggleCamera, 
    toggleMic 
  } = useWebRTC();

  useEffect(() => {
    document.body.classList.add('hide-navbar');
    return () => {
      document.body.classList.remove('hide-navbar');
    };
  }, []);

  const loadPlayers = async (currentRoomId: string) => {
    try {
      setLoading(true);
      const result = await getRoomPlayers(currentRoomId);
      setPlayers(result);
      if (result.find((p: RoomPlayer) => p.isOwner)) {
        setIsHost(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChooseSeat = async (seatNumber: number) => {
    if (!roomId) return;
    try {
      await chooseSeat(roomId, seatNumber);
      await loadPlayers(roomId);
    } catch (error) {
      console.error(error);
      alert("Не вдалося зайняти місце");
    }
  };

  const handleStartGame = () => ready();
  const handleLeave = () => navigate('/');

  useEffect(() => {
    if (!roomId) return;
    loadPlayers(roomId);
  }, [roomId]);

  useEffect(() => {
    if (phase !== 'waiting' && phase !== 'ended' && roomId) {
      navigate(`/game/${roomId}`);
    }
  }, [phase, roomId, navigate]);

  const getPlayerBySeat = (seatNumber: number) => {
    return players.find((p) => p.seatNumber === seatNumber);
  };

  const renderCamera = (seatNumber: number) => {
    const player = getPlayerBySeat(seatNumber);
    const showCamera = localStream !== null;

    if (player) {
      return (
        <div className={`player-camera occupied pos-${seatNumber}`}>
          <div className="seat-number">{seatNumber}</div>
          
          <div className="camera-video">
            {showCamera ? (
              <VideoPlayer stream={localStream} />
            ) : (
              <div className="camera-avatar">
                <div className="avatar-placeholder">
                  {player.nickname.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>

          <div className="camera-info">
            <span className="player-name">{player.nickname}</span>
            {player.isOwner && <span className="player-role">Ведучий</span>}
          </div>
          
          <div className="camera-controls">
            <span className={`mic-icon ${isMicOn ? 'on' : 'off'}`}>🎤</span>
            <span className={`camera-icon ${isCameraOn ? 'on' : 'off'}`}>📹</span>
          </div>
        </div>
      );
    }

    return (
      <div 
        className={`player-camera empty pos-${seatNumber}`}
        onClick={() => handleChooseSeat(seatNumber)}
      >
        <div className="seat-number">{seatNumber}</div>
        <div className="camera-avatar">
          <div className="avatar-placeholder">+</div>
        </div>
        <div className="camera-info">
          <span className="player-name">Вільне місце</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Завантаження кімнати...</p>
      </div>
    );
  }

  return (
    <div className="room-lobby">
      <div className="lobby-header">
        <h2>Кімната: Mafia Room</h2>
        <div className="connection-status">
          {connected ? '🟢 Лобі' : '🔴 Підключення...'}
          <span>ID: {roomId?.slice(0, 8)}</span>
        </div>
        {isHost && (
          <button onClick={handleStartGame} className="action-btn start">
            🚀 Почати гру
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
            <div className="table-center-logo">
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
        <button onClick={handleLeave} className="leave-btn">← Вийти</button>
        <div className="host-info">🎤 Ведучий: <span className="host-name">Andrew</span></div>
        <div className="panel-controls">
          {/* ✅ Кнопка мікрофона з діагностикою */}
          <button 
            className={`panel-btn ${isMicOn ? 'active' : ''}`} 
            onClick={() => {
              console.log('🔘 Кнопка мікрофона натиснута! isMicOn до:', isMicOn);
              toggleMic();
              console.log('🔘 Після toggleMic isMicOn має змінитися');
            }}
          >
            {isMicOn ? '🎤' : '🎤❌'} Мікрофон
          </button>
          
          {/* ✅ Кнопка камери з діагностикою */}
          <button 
            className={`panel-btn ${isCameraOn ? 'active' : ''}`} 
            onClick={() => {
              console.log('🔘 Кнопка камери натиснута! isCameraOn до:', isCameraOn);
              toggleCamera();
            }}
          >
            {isCameraOn ? '📹' : '📹❌'} Камера
          </button>
        </div>
        <div className="players-count">👥 {players.length} / 10</div>
      </div>
    </div>
  );
}

function VideoPlayer({ stream }: { stream: MediaStream | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream]);

  if (!stream) {
    return (
      <div className="camera-avatar">
        <div className="avatar-placeholder">?</div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="video-stream"
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}
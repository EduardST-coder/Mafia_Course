import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoomPlayers, chooseSeat } from "../services/roomService";
import { useGameHub } from "../hooks/useGameHub";
import type { RoomPlayer } from "../types/RoomPlayer";
import "../styles/rooms.css";

export default function RoomLobbyPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);

  const { connected, phase, ready } = useGameHub(roomId || '');

  const loadPlayers = async (currentRoomId: string) => {
    try {
      setLoading(true);
      const result = await getRoomPlayers(currentRoomId);
      setPlayers(result);
      const me = result.find((p: RoomPlayer) => p.isOwner);
      if (me) {
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

  const handleStartGame = () => {
    ready();
  };

  const handleLeave = () => {
    navigate('/');
  };

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

    if (player) {
      return (
        <div className={`player-camera occupied pos-${seatNumber}`}>
          <div className="seat-number">{seatNumber}</div>
          <div className="camera-avatar">
            <div className="avatar-placeholder">
              {player.nickname.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="camera-info">
            <span className="player-name">{player.nickname}</span>
            {player.isOwner && <span className="player-role">Ведучий</span>}
          </div>
          <div className="camera-controls">
            <span className="mic-icon">🎤</span>
            <span className="signal-icon">📶</span>
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
      </div>

      <div className="mafia-table">
        {renderCamera(10)}
        {renderCamera(1)}
        {renderCamera(2)}
        {renderCamera(3)}
        {renderCamera(4)}
        {renderCamera(5)}
        {renderCamera(6)}
        {renderCamera(7)}
        {renderCamera(8)}
        {renderCamera(9)}

        <div className="table-center-logo">
          <div className="logo-icon">🎩</div>
          <div className="logo-text">MAFIA</div>
          <div className="logo-sub">ONLINE</div>
        </div>
      </div>

      <div className="lobby-actions">
        {isHost && (
          <button onClick={handleStartGame} className="action-btn start">
            🚀 Почати гру
          </button>
        )}
        <button onClick={handleLeave} className="action-btn leave">
          Вийти
        </button>
      </div>

            <div className="bottom-panel">
        <button onClick={handleLeave} className="leave-btn">
          ← Вийти
        </button>
        <div className="host-info">
          🎤 Ведучий: <span className="host-name">Andrew</span>
        </div>
        <div className="panel-controls">
          <button className="panel-btn active">🎤 Мікрофон</button>
          <button className="panel-btn">📹 Камера</button>
          <button className="panel-btn">💬 Чат</button>
          <button className="panel-btn">👥 Гравці</button>
        </div>
        <div className="players-count">
          👥 {players.length} / 10
        </div>
      </div>
    </div>
  );
}
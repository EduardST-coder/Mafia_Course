import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRoomPlayers, chooseSeat } from "../services/roomService";
import type { RoomPlayer } from "../types/RoomPlayer";
import HostInfo from "../components/room/HostInfo";

export default function RoomLobbyPage() {
  const { roomId } = useParams();
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlayers = async (currentRoomId: string) => {
    try {
      setLoading(true);
      const result = await getRoomPlayers(currentRoomId);
      setPlayers(result);
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

  useEffect(() => {
    if (!roomId) return;
    loadPlayers(roomId);
  }, [roomId]);

  const renderSeat = (seatNumber: number) => {
    const player = players.find((x) => x.seatNumber === seatNumber);

    if (player) {
      return (
        <div className="seat-card occupied">
          <div className="seat-badge">№{seatNumber}</div>
          <div className="seat-avatar">
            <div className="avatar-placeholder">
              {player.nickname.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="seat-info">
            <div className="seat-name">{player.nickname}</div>
            <div className="seat-status">{player.isOwner ? "Ведучий" : "Гравець"}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="seat-card empty" onClick={() => handleChooseSeat(seatNumber)}>
        <div className="seat-badge">№{seatNumber}</div>
        <div className="seat-avatar empty-avatar">
          <span>+</span>
        </div>
        <div className="seat-info">
          <div className="seat-name">Вільне місце</div>
          <div className="seat-status click-hint">Натисніть щоб сісти</div>
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
      <div className="table-row top">
        <div className="seat-wrapper">{renderSeat(10)}</div>
        <div className="table-center">
          <div className="table-logo">🎩</div>
          <div className="table-name">MAFIA TABLE</div>
        </div>
        <div className="seat-wrapper">{renderSeat(1)}</div>
        <div className="seat-wrapper">{renderSeat(2)}</div>
      </div>

      <div className="table-row middle">
        <div className="seat-wrapper">{renderSeat(9)}</div>
        <div className="table-middle-space"></div>
        <div className="seat-wrapper">{renderSeat(3)}</div>
      </div>

      <div className="table-row bottom">
        <div className="seat-wrapper">{renderSeat(8)}</div>
        <div className="seat-wrapper">{renderSeat(7)}</div>
        <div className="seat-wrapper">{renderSeat(6)}</div>
        <div className="seat-wrapper">{renderSeat(5)}</div>
        <div className="seat-wrapper">{renderSeat(4)}</div>
      </div>

      <div className="host-section">
        <HostInfo hostName="Andrew" />
      </div>
    </div>
  );
}
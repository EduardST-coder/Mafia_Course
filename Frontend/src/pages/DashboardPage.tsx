import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms, createRoom, joinRoom } from "../services/roomService";
import { apiClient } from "../api/apiClient";
import type { Room, CreateRoomRequest } from "../types/Room";

interface HomeStats {
  onlineNow: number;
  inGame: number;
  inLobby: number;
  lookingForGame: number;
  totalRooms: number;
  activeGames: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Модалка створення столу
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoom, setNewRoom] = useState<CreateRoomRequest>({
    name: "",
    maxPlayers: 10,
    isPrivate: false,
    password: "",
  });

  // ✅ НОВЕ: Модалка введення пароля
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomPassword, setRoomPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      
      const [roomsData, statsData] = await Promise.all([
        getRooms(),
        apiClient.get<HomeStats>('/public/stats')
      ]);
      
      setRooms(roomsData);
      setStats(statsData.data);
    } catch (err) {
      setError("Не вдалося завантажити дані. Спробуйте пізніше.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRoom() {
    try {
      await createRoom(newRoom);
      setShowCreateModal(false);
      setNewRoom({ name: "", maxPlayers: 10, isPrivate: false, password: "" });
      loadData();
    } catch (err) {
      alert("Не вдалося створити стіл");
      console.error(err);
    }
  }

  // ✅ НОВЕ: Обробка кліку "Приєднатися"
  function handleJoinRoom(room: Room) {
    if (room.isPrivate) {
      setSelectedRoom(room);
      setRoomPassword("");
      setPasswordError(null);
      setShowPasswordModal(true);
    } else {
      // Відкрита кімната — одразу переходимо
      navigate(`/rooms/${room.id}`);
    }
  }

  // ✅ НОВЕ: Підтвердження пароля
  async function handlePasswordSubmit() {
    if (!selectedRoom) return;
    
    if (!roomPassword.trim()) {
      setPasswordError("Введіть пароль");
      return;
    }

    setJoining(true);
    setPasswordError(null);

    try {
  await joinRoom(selectedRoom.id, roomPassword);  // ✅ прибрати roomPassword якщо joinRoom приймає 1 аргумент
  setShowPasswordModal(false);
  setSelectedRoom(null);
  setRoomPassword("");
  navigate(`/rooms/${selectedRoom.id}`);  // ✅ selectedRoom.id замість room.id
} catch (err: unknown) {  // ✅ unknown замість any
  const error = err as { response?: { data?: { message?: string } } };
  setPasswordError(error.response?.data?.message || "Невірний пароль");
} finally {
  setJoining(false);
}
  }

  // ✅ НОВЕ: Закрити модалку пароля
  function closePasswordModal() {
    setShowPasswordModal(false);
    setSelectedRoom(null);
    setRoomPassword("");
    setPasswordError(null);
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Завантаження...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ paddingTop: "40px", textAlign: "center" }}>
        <p style={{ color: "#ff6b6b", marginBottom: "16px" }}>{error}</p>
        <button className="primary-button" onClick={loadData}>
          Спробувати знову
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "40px", paddingBottom: "60px" }}>
      {/* ... Hero section без змін ... */}
      <section
        className="card"
        style={{
          padding: "60px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <div>
          <div style={{ color: "var(--gold)", fontWeight: 600, marginBottom: "12px" }}>
            ГРАЙ. ДУМАЙ. ПЕРЕМАГАЙ.
          </div>

          <h1 style={{ fontSize: "56px", lineHeight: 1.1, marginBottom: "20px" }}>
            ЛЕГЕНДА
            <br />
            ПОЧИНАЄТЬСЯ
            <br />
            З ТЕБЕ
          </h1>

          <p style={{ maxWidth: "500px", color: "var(--text-secondary)", marginBottom: "30px" }}>
            Приєднуйся до гри, знаходь союзників, блефуй та перемагай у світі Mafia Online.
          </p>

          <div style={{ display: "flex", gap: "16px" }}>
            <button className="primary-button" onClick={() => navigate("/rooms")}>
              Швидка гра
            </button>

            <button className="secondary-button" onClick={() => setShowCreateModal(true)}>
              Створити стіл
            </button>
          </div>
        </div>

        <div className="card" style={{ width: "300px", padding: "30px" }}>
          <div style={{ color: "var(--text-secondary)", marginBottom: "12px" }}>
            Онлайн зараз
          </div>
          <div style={{ fontSize: "48px", fontWeight: 700, marginBottom: "24px" }}>
            {stats?.onlineNow ?? 0}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>🎮 У грі: {stats?.inGame ?? 0}</div>
            <div>🏠 У лобі: {stats?.inLobby ?? 0}</div>
            <div>🔎 Шукають гру: {stats?.lookingForGame ?? 0}</div>
          </div>
        </div>
      </section>

      {/* Список кімнат */}
      <section>
        <h2 className="section-title">Популярні столи</h2>
        <p className="section-subtitle">Обирай гру та приєднуйся до інших гравців.</p>

        {rooms.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
              Немає доступних столів
            </p>
            <button className="primary-button" onClick={() => setShowCreateModal(true)}>
              Створити перший стіл
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {rooms.map((room) => (
              <div key={room.id} className="card" style={{ padding: "24px" }}>
                <h3 style={{ marginBottom: "12px" }}>{room.name}</h3>
                <p style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>
                  Гравців: {room.playersCount}/{room.maxPlayers}
                </p>
                <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
                  {room.isPrivate ? "Приватний 🔒" : "Відкритий 🌐"}
                </p>
                <button
                  className="primary-button"
                  style={{ width: "100%" }}
                  onClick={() => handleJoinRoom(room)} // ✅ ОНОВЛЕНО
                >
                  {room.isPrivate ? "Ввести пароль 🔒" : "Приєднатися"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ✅ ОНОВЛЕНО: Модалка створення столу (rename showModal → showCreateModal) */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ padding: "32px", width: "400px", maxWidth: "90%" }}>
            <h3 style={{ marginBottom: "24px" }}>Створити стіл</h3>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                Назва столу
              </label>
              <input
                className="text-input"
                type="text"
                placeholder="VIP Table #1"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                Кількість гравців
              </label>
              <input
                className="text-input"
                type="number"
                min={2}
                max={20}
                value={newRoom.maxPlayers}
                onChange={(e) => setNewRoom({ ...newRoom, maxPlayers: Number(e.target.value) })}
              />
            </div>

            <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="isPrivate"
                checked={newRoom.isPrivate}
                onChange={(e) => setNewRoom({ ...newRoom, isPrivate: e.target.checked })}
              />
              <label htmlFor="isPrivate">Приватний стіл</label>
            </div>

            {newRoom.isPrivate && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                  Пароль
                </label>
                <input
                  className="text-input"
                  type="password"
                  placeholder="Введіть пароль"
                  value={newRoom.password}
                  onChange={(e) => setNewRoom({ ...newRoom, password: e.target.value })}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button className="primary-button" style={{ flex: 1 }} onClick={handleCreateRoom}>
                Створити
              </button>
              <button className="secondary-button" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ НОВЕ: Модалка введення пароля */}
      {showPasswordModal && selectedRoom && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ padding: "32px", width: "400px", maxWidth: "90%" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔒</div>
              <h3 style={{ marginBottom: "8px" }}>Приватна кімната</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Щоб приєднатися до <strong>{selectedRoom.name}</strong>, введіть пароль
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                Пароль
              </label>
              <input
                className="text-input"
                type="password"
                placeholder="Введіть пароль кімнати"
                value={roomPassword}
                onChange={(e) => {
                  setRoomPassword(e.target.value);
                  setPasswordError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                autoFocus
              />
              {passwordError && (
                <p style={{ color: "#ff6b6b", fontSize: "14px", marginTop: "8px" }}>
                  {passwordError}
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                className="primary-button"
                style={{ flex: 1 }}
                onClick={handlePasswordSubmit}
                disabled={joining}
              >
                {joining ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <span className="loading-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></span>
                    Перевірка...
                  </span>
                ) : (
                  "Приєднатися"
                )}
              </button>
              <button
                className="secondary-button"
                style={{ flex: 1 }}
                onClick={closePasswordModal}
                disabled={joining}
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
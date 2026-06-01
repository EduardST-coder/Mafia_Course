import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms, createRoom } from "../services/roomService";
import type { Room, CreateRoomRequest } from "../types/Room";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newRoom, setNewRoom] = useState<CreateRoomRequest>({
    name: "",
    maxPlayers: 10,
    isPrivate: false,
    password: "",
  });

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    try {
      setLoading(true);
      setError(null);
      const data = await getRooms();
      setRooms(data);
    } catch (err) {
      setError("Не вдалося завантажити столи. Спробуйте пізніше.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRoom() {
    try {
      await createRoom(newRoom);
      setShowModal(false);
      setNewRoom({ name: "", maxPlayers: 10, isPrivate: false, password: "" });
      loadRooms();
    } catch (err) {
      alert("Не вдалося створити стіл");
      console.error(err);
    }
  }

  function handleJoinRoom(roomId: string) {
    navigate(`/rooms/${roomId}`);
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Завантаження столів...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ paddingTop: "40px", textAlign: "center" }}>
        <p style={{ color: "#ff6b6b", marginBottom: "16px" }}>{error}</p>
        <button className="primary-button" onClick={loadRooms}>
          Спробувати знову
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "40px", paddingBottom: "60px" }}>
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

            <button className="secondary-button" onClick={() => setShowModal(true)}>
              Створити стіл
            </button>
          </div>
        </div>

        <div className="card" style={{ width: "300px", padding: "30px" }}>
          <div style={{ color: "var(--text-secondary)", marginBottom: "12px" }}>
            Онлайн зараз
          </div>
          <div style={{ fontSize: "48px", fontWeight: 700, marginBottom: "24px" }}>
            {rooms.length > 0 ? rooms.length * 3 + 200 : 1246}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>🎮 У грі: {rooms.filter(r => r.playersCount > 0).length * 2 + 100}</div>
            <div>🏠 У лобі: {rooms.filter(r => r.playersCount === 0).length * 2 + 50}</div>
            <div>🔎 Шукають гру: {rooms.length * 2 + 30}</div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">Популярні столи</h2>
        <p className="section-subtitle">Обирай гру та приєднуйся до інших гравців.</p>

        {rooms.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
              Немає доступних столів
            </p>
            <button className="primary-button" onClick={() => setShowModal(true)}>
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
                  onClick={() => handleJoinRoom(room.id)}
                >
                  Приєднатися
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {showModal && (
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
              <button className="secondary-button" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
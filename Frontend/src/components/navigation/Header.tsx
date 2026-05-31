import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header
      style={{
        background: "#ffffff",
        borderBottom:
          "1px solid var(--border)"
      }}
    >
      <div
        className="page-container"
        style={{
          height: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between"
        }}
      >
        <Link
          to="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}
        >
          <div
            style={{
              fontSize: "32px"
            }}
          >
            🎩
          </div>

          <div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 700
              }}
            >
              MAFIA
            </div>

            <div
              style={{
                color:
                  "var(--text-secondary)",
                fontSize: "12px"
              }}
            >
              ONLINE
            </div>
          </div>
        </Link>

        <nav
          style={{
            display: "flex",
            gap: "32px"
          }}
        >
          <Link to="/dashboard">
            Головна
          </Link>

          <Link to="/rooms">
            Столи
          </Link>

          <Link to="/rating">
            Рейтинг
          </Link>

          <Link to="/profile">
            Профіль
          </Link>
        </nav>

        <button
          className="primary-button"
        >
          Створити стіл
        </button>
      </div>
    </header>
  );
}
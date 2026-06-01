import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Breadcrumbs from "./Breadcrumbs";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="page-container header-container">
        {/* Логотип */}
        <Link to="/dashboard" className="header-logo">
          <span className="header-logo-icon">🎩</span>
          <div className="header-logo-text">
            <span className="header-logo-title">MAFIA</span>
            <span className="header-logo-subtitle">ONLINE</span>
          </div>
        </Link>

        {/* Breadcrumbs по центру */}
        <div className="header-breadcrumbs">
          <Breadcrumbs />
        </div>

        {/* Користувач справа */}
        <div className="header-actions">
          {isAuthenticated && user ? (
            <div className="header-user">
              <div className="header-user-info">
                <span className="header-user-name">{user.nickname}</span>
                <span className="header-user-rating">⭐ {user.rating}</span>
              </div>
              <img 
                src={user.avatarUrl || "/default-avatar.png"} 
                alt={user.nickname}
                className="header-user-avatar"
              />
              <button onClick={handleLogout} className="header-logout">
                Вийти
              </button>
            </div>
          ) : (
            <Link to="/login" className="primary-button">
              Увійти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
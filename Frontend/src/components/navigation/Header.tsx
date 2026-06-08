import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="header">
      <Link to="/" className="logo">
        <span className="logo-icon">🎩</span>
        <span className="logo-text">MAFIA ONLINE</span>
      </Link>
      
      <nav className="nav-links">
        <Link to="/" className="nav-link">
          🏠 Головна
        </Link>
        <Link to="/profile" className="nav-link">
          👤 Профіль
        </Link>
        
        {/* Кнопка адміна тільки для адміна */}
        {user?.role === 'Admin' && (
          <Link to="/admin" className="nav-link admin-link">
            🛡️ Адмін
          </Link>
        )}
      </nav>

      <div className="user-section">
        {user ? (
          <>
            <span className="user-name">{user.nickname}</span>
            <button onClick={logout} className="btn-logout">
              Вийти
            </button>
          </>
        ) : (
          <Link to="/login" className="btn-login">
            Увійти
          </Link>
        )}
      </div>
    </header>
  );
}
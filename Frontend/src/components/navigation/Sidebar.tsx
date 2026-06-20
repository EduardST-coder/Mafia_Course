import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const menuItems = [
  { path: "/", label: "Головна", icon: "🏠" },
  { path: "/profile", label: "Профіль", icon: "👤" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${isActive(item.path) ? "sidebar-link-active" : ""}`}
            onClick={onClose}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}

        {user?.role === "Admin" && (
          <Link
            to="/admin"
            className={`sidebar-link ${isActive("/admin") ? "sidebar-link-active" : ""}`}
            onClick={onClose}
          >
            <span className="sidebar-icon">🛡️</span>
            <span className="sidebar-label">Адмін</span>
          </Link>
        )}
      </nav>

      {/* Профіль внизу сайдбару */}
      <div className="sidebar-footer">
        {user ? (
          <div className="sidebar-profile">
            <div className="sidebar-profile-avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.nickname} />
              ) : (
                <span>{user.nickname?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div className="sidebar-profile-info">
              <span className="sidebar-profile-name">{user.nickname}</span>
              <span className="sidebar-profile-rating">⭐ {user.rating || 0}</span>
            </div>
            <button onClick={logout} className="sidebar-logout">
              🚪
            </button>
          </div>
        ) : (
          <Link to="/login" className="sidebar-login" onClick={onClose}>
            <span className="sidebar-icon">🔑</span>
            <span className="sidebar-label">Увійти</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
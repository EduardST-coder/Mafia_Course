import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { path: "/dashboard", label: "Головна", icon: "🏠" },
  { path: "/profile", label: "Профіль", icon: "👤" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
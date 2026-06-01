import { Link, useLocation } from "react-router-dom";

const routeNames: Record<string, string> = {
  dashboard: "Головна",
  rooms: "Кімната",
  profile: "Профіль",
};

export default function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);

  if (location.pathname === "/" || location.pathname === "/dashboard") {
    return <span className="breadcrumb-current">Головна</span>;
  }

  return (
    <nav className="breadcrumbs">
      <Link to="/dashboard" className="breadcrumb-link">Головна</Link>
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        const name = routeNames[path] || path;
        const to = "/" + paths.slice(0, index + 1).join("/");

        return (
          <span key={path} className="breadcrumb-item">
            <span className="breadcrumb-separator">/</span>
            {isLast ? (
              <span className="breadcrumb-current">{name}</span>
            ) : (
              <Link to={to} className="breadcrumb-link">{name}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
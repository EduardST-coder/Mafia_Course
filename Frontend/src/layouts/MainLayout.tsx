import { Outlet } from "react-router-dom";
import Header from "../components/navigation/Header";
import "../styles/theme.css";

export default function MainLayout() {
  return (
    <div className="main-layout">
      <Header />
      <main className="main-content">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
      <footer className="main-footer">
        <div className="page-container">
          <p>© 2024 Mafia Online. Усі права захищені.</p>
        </div>
      </footer>
    </div>
  );
}
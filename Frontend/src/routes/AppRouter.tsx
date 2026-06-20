import {
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import RoomLobbyPage from "../pages/RoomLobbyPage";
import RoomPage from "../pages/RoomPage";
import PlayerPage from "../pages/PlayerPage";
import AdminPage from "../pages/AdminPage";
import MainLayout from "../layouts/MainLayout";
import GoogleCallbackPage from "../pages/GoogleCallbackPage";
import { useAuth } from "../context/AuthContext";

function AdminRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Завантаження...</p>
      </div>
    );
  }

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Публічні роути БЕЗ sidebar */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

      {/* Роути З sidebar (через MainLayout з Outlet) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/rooms/:roomId" element={<RoomLobbyPage />} />
        <Route path="/game/:roomId" element={<RoomPage />} />
        <Route path="/profile" element={<PlayerPage />} />
        <Route path="/player/:userId" element={<PlayerPage />} />

        {/* Адмін роути з захистом */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
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
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

      <Route
        path="/"
        element={
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        }
      />

      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        }
      />

      <Route
        path="/rooms/:roomId"
        element={
          <MainLayout>
            <RoomLobbyPage />
          </MainLayout>
        }
      />

      <Route
        path="/game/:roomId"
        element={
          <MainLayout>
            <RoomPage />
          </MainLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <MainLayout>
            <PlayerPage />
          </MainLayout>
        }
      />

      <Route
        path="/player/:userId"
        element={
          <MainLayout>
            <PlayerPage />
          </MainLayout>
        }
      />

      <Route element={<AdminRoute />}>
        <Route
          path="/admin"
          element={
            <MainLayout>
              <AdminPage />
            </MainLayout>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
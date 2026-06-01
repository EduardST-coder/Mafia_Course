import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import RoomLobbyPage from "../pages/RoomLobbyPage";
import RoomPage from "../pages/RoomPage";
import MainLayout from "../layouts/MainLayout";
import GoogleCallbackPage from "../pages/GoogleCallbackPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Публічні маршрути */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

        {/* Головна сторінка */}
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

        {/* Лобі кімнати */}
        <Route
          path="/rooms/:roomId"
          element={
            <MainLayout>
              <RoomLobbyPage />
            </MainLayout>
          }
        />

        {/* Ігрова сторінка */}
        <Route
          path="/game/:roomId"
          element={
            <MainLayout>
              <RoomPage />
            </MainLayout>
          }
        />

        {/* Редирект невідомих шляхів */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
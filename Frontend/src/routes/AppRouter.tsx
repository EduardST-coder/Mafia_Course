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

import MainLayout from "../layouts/MainLayout";
import GoogleCallbackPage from "../pages/GoogleCallbackPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Публічні маршрути */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Головна сторінка — тут і столи, і все інше */}
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

        {/* Кімната — за ID */}
        <Route
          path="/rooms/:roomId"
          element={
            <MainLayout>
              <RoomLobbyPage />
            </MainLayout>
          }
        />

        {/* Редирект невідомих шляхів */}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

      </Routes>
    </BrowserRouter>
  );
}
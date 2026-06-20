import axios from "axios";

// ===== HTTP API =====
export const apiClient = axios.create({
  baseURL: "https://localhost:7000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — додає токен до кожного запиту
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — обробка помилок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    
    if (error.response?.status === 403) {
      console.error("Доступ заборонено");
    }
    
    // 405 Method Not Allowed — логуємо деталі
    if (error.response?.status === 405) {
      console.error("405 Method Not Allowed:", {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
      });
    }
    
    return Promise.reject(error);
  }
);

// ===== SIGNALR CONFIG =====
export const SIGNALR_URL = "https://localhost:7000/hubs/game";
// ↑ Зміни на твій порт! Якщо Hub на 7001 — постав "https://localhost:7001/hubs/game"

// Перевірка чи SignalR доступний
export const checkSignalRConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${SIGNALR_URL}/negotiate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};
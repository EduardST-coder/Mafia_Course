import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "./AuthContext";

// claim-ключі з .NET бекенду
const NAME_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

/** Розкодовує payload JWT */
function parseToken(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Будує User з токена */
function parseUserFromToken(token: string): Partial<User> | null {
  const p = parseToken(token);
  if (!p) return null;

  return {
    id: String(p.sub ?? p.nameid ?? ""),
    email: String(p.email ?? p.Email ?? ""),
    nickname: String(p[NAME_CLAIM] ?? "Гравець"),
    role: String(p[ROLE_CLAIM] ?? "Player"),
    rating: Number(p.rating ?? 0),
  };
}

const isAdminEmail = (email: string): boolean => {
  return email.trim().toLowerCase() === "stugaed@gmail.com";
};

const ensureAdminRole = (u: User): User => {
  if (isAdminEmail(u.email)) {
    return { ...u, role: "Admin" };
  }
  return u;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken) {
      try {
        // ✅ Пріоритет: роль з токена (сервер — джерело правди)
        const tokenData = parseUserFromToken(savedToken);
        let finalUser: User | null = null;

        if (savedUser) {
          const parsedUser = JSON.parse(savedUser) as User;

          // Мерж: токен має пріоритет для id/role/email, localStorage — для решти
          finalUser = {
            ...parsedUser,
            id: tokenData?.id || parsedUser.id,
            role: tokenData?.role || parsedUser.role, // Роль з токена!
            email: tokenData?.email || parsedUser.email,
            nickname: parsedUser.nickname || tokenData?.nickname || "Гравець",
            avatarUrl: parsedUser.avatarUrl,
            rating: parsedUser.rating || tokenData?.rating || 0,
          };
        } else if (tokenData) {
          finalUser = {
            id: tokenData.id || "",
            email: tokenData.email || "",
            nickname: tokenData.nickname || "Гравець",
            role: tokenData.role || "Player",
            rating: tokenData.rating || 0,
            avatarUrl: undefined,
          };
        }

        if (finalUser) {
          const userWithRole = ensureAdminRole(finalUser);
          
          // Оновлюємо localStorage, якщо змінилось
          localStorage.setItem("user", JSON.stringify(userWithRole));
          
          setToken(savedToken);
          setUser(userWithRole);
        }
      } catch (e) {
        console.error("Auth init error:", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    let finalUser = newUser;

    // Парсимо токен для впевненості, що роль актуальна
    const tokenData = parseUserFromToken(newToken);
    if (tokenData?.role) {
      finalUser = { ...finalUser, role: tokenData.role };
    }

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as User;
        const sameUser =
          (!!newUser.id && parsed.id === newUser.id) ||
          (!!newUser.email && parsed.email === newUser.email);

        if (sameUser) {
          finalUser = {
            ...finalUser,
            nickname: (newUser.nickname && newUser.nickname !== "Google User" && newUser.nickname !== "Гравець")
              ? newUser.nickname
              : (parsed.nickname && parsed.nickname !== "Google User" && parsed.nickname !== "Гравець")
                ? parsed.nickname
                : "Гравець",
            avatarUrl: newUser.avatarUrl ?? parsed.avatarUrl,
          };
        }
      } catch {
        // ignore
      }
    }

    const userWithRole = ensureAdminRole(finalUser);

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userWithRole));
    setToken(newToken);
    setUser(userWithRole);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };

      try {
        localStorage.setItem("user", JSON.stringify(updated));
      } catch (e) {
        console.error("localStorage quota exceeded:", e);

        if (updated.avatarUrl?.startsWith("data:")) {
          const withoutAvatar = { ...updated, avatarUrl: undefined };
          try {
            localStorage.setItem("user", JSON.stringify(withoutAvatar));
            alert("Фото занадто велике для локального збереження. Збережено без фото.");
            return withoutAvatar;
          } catch {
            alert("Профіль занадто великий для збереження.");
          }
        }
      }

      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        setUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
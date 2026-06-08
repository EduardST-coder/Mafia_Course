import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "./AuthContext";

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

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        const userWithRole = ensureAdminRole(parsedUser);

        if (parsedUser.role !== userWithRole.role) {
          localStorage.setItem("user", JSON.stringify(userWithRole));
        }

        setToken(savedToken);
        setUser(userWithRole);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    let finalUser = newUser;

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as User;
        // той самий користувач? (id або email тепер СПРАВЖНІ з токена)
        const sameUser =
          (!!newUser.id && parsed.id === newUser.id) ||
          (!!newUser.email && parsed.email === newUser.email);

        if (sameUser) {
          // зберігаємо локальні правки профілю поверх свіжих даних токена
          finalUser = {
            ...newUser,
            nickname: parsed.nickname || newUser.nickname,
            avatarUrl: parsed.avatarUrl ?? newUser.avatarUrl,
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
      localStorage.setItem("user", JSON.stringify(updated));
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
import { createContext, useContext } from "react";

export interface User {
  id: string;
  nickname: string;
  email: string;
  avatarUrl?: string;
  rating: number;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const defaultValue: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
};

// ВИПРАВЛЕНО: createContext<<AuthContextType> (одна <, не дві!)
export const AuthContext = createContext<AuthContextType>(defaultValue);

export const useAuth = () => useContext(AuthContext);
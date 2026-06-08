import type { User } from "../context/AuthContext";

// claim-ключі, які видає ваш .NET бекенд (видно в декодованому токені)
const NAME_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

/** Розкодовує payload JWT (base64url) у звичайний об'єкт */
function decodePayload(token: string): Record<string, unknown> | null {
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

/** Будує об'єкт User зі справжніх даних токена */
export function parseUserFromToken(token: string): User | null {
  const p = decodePayload(token);
  if (!p) return null;

  return {
    id: String(p.sub ?? p.nameid ?? ""),
    email: String(p.email ?? p.Email ?? ""),
    nickname: String(p[NAME_CLAIM] ?? "Гравець"),
    role: String(p[ROLE_CLAIM] ?? "Player"),
    rating: Number(p.rating ?? 0),
  };
}
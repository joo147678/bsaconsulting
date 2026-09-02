import { useCallback, useEffect, useState } from "react";

export type SessionRole = "accountant" | "supervisor";

const ROLE_KEY = "bsa-session-role";

let cache: SessionRole | null = null;
const listeners = new Set<() => void>();

function readRole(): SessionRole {
  if (cache) return cache;
  if (typeof window === "undefined") return "accountant";
  cache = window.localStorage.getItem(ROLE_KEY) === "supervisor" ? "supervisor" : "accountant";
  return cache;
}

function writeRole(role: SessionRole) {
  cache = role;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ROLE_KEY, role);
  }
  listeners.forEach((l) => l());
}

export function useSession() {
  const [role, setRoleState] = useState<SessionRole>(() =>
    typeof window === "undefined" ? "accountant" : readRole(),
  );

  useEffect(() => {
    const l = () => setRoleState(readRole());
    listeners.add(l);
    setRoleState(readRole());
    return () => {
      listeners.delete(l);
    };
  }, []);

  const setRole = useCallback((next: SessionRole) => writeRole(next), []);

  return { role, setRole, isSupervisor: role === "supervisor" };
}

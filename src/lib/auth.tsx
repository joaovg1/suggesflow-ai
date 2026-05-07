import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "employee" | null;

interface AuthCtx {
  user: User | null;
  session: Session | null;
  role: Role; // active role (what user chose at login)
  actualRole: Role; // real role from DB
  isAdmin: boolean; // has admin permission in DB
  setActiveRole: (r: "admin" | "employee") => void;
  loading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  role: null,
  actualRole: null,
  isAdmin: false,
  setActiveRole: () => {},
  loading: true,
  signOut: async () => {},
});

const ACTIVE_ROLE_KEY = "activeRole";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [actualRole, setActualRole] = useState<Role>(null);
  const [activeRole, setActiveRoleState] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  const applyRole = (real: Role) => {
    setActualRole(real);
    const stored = typeof window !== "undefined" ? (localStorage.getItem(ACTIVE_ROLE_KEY) as Role) : null;
    if (stored === "admin" && real === "admin") setActiveRoleState("admin");
    else if (stored === "employee") setActiveRoleState("employee");
    else setActiveRoleState(real);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(async () => {
          const { data } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", s.user.id)
            .maybeSingle();
          applyRole((data?.role as Role) ?? "employee");
        }, 0);
      } else {
        setActualRole(null);
        setActiveRoleState(null);
        if (typeof window !== "undefined") localStorage.removeItem(ACTIVE_ROLE_KEY);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", s.user.id)
          .maybeSingle();
        applyRole((data?.role as Role) ?? "employee");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const setActiveRole = (r: "admin" | "employee") => {
    if (r === "admin" && actualRole !== "admin") return;
    if (typeof window !== "undefined") localStorage.setItem(ACTIVE_ROLE_KEY, r);
    setActiveRoleState(r);
  };

  const signOut = async () => {
    if (typeof window !== "undefined") localStorage.removeItem(ACTIVE_ROLE_KEY);
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{
      user,
      session,
      role: activeRole,
      actualRole,
      isAdmin: actualRole === "admin",
      setActiveRole,
      loading,
      signOut,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

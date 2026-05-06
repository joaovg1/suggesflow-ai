import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
interface ThemeCtx { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void; }

const Ctx = createContext<ThemeCtx>({ theme: "light", toggle: () => {}, setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("theme")) as Theme | null;
    const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial: Theme = saved ?? (prefersDark ? "dark" : "light");
    setThemeState(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    try { localStorage.setItem("theme", t); } catch {}
  };

  return <Ctx.Provider value={{ theme, toggle: () => setTheme(theme === "dark" ? "light" : "dark"), setTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);

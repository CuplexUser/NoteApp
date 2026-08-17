import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";

export type ThemeMode = "light" | "dark";
const STORAGE_KEY = "notes-app-theme";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  function toggleMode() {
    setMode((m) => (m === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleMode }}>
      <ConfigProvider
        theme={{
          algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: { colorPrimary: "#1677ff", borderRadius: 8 },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeMode must be used within a ThemeProvider");
  return ctx;
}


import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  autoTheme: boolean;
  setAutoTheme: (auto: boolean) => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  autoTheme: false,
  setAutoTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "kifaa-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [autoTheme, setAutoTheme] = useState<boolean>(
    () => localStorage.getItem(`${storageKey}-auto`) === "true"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    if (autoTheme) {
      // Set theme based on time of day if auto theme is enabled
      const hours = new Date().getHours();
      const newTheme = hours >= 6 && hours < 18 ? "light" : "dark";
      setTheme(newTheme);
      
      // Store auto theme preference
      localStorage.setItem(`${storageKey}-auto`, "true");
    } else {
      localStorage.setItem(`${storageKey}-auto`, "false");
    }
  }, [autoTheme, storageKey]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    autoTheme,
    setAutoTheme
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

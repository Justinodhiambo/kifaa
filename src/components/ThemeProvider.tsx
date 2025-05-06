
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableAutoTheme?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  autoTheme: boolean;
  setAutoTheme: (auto: boolean) => void;
};

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
  autoTheme: false,
  setAutoTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "kifaa-ui-theme",
  enableAutoTheme = true,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  const [autoTheme, setAutoTheme] = useState<boolean>(
    () => localStorage.getItem(storageKey + "-auto") === "true"
  );

  // Set theme based on time of day if auto theme is enabled
  useEffect(() => {
    if (autoTheme && enableAutoTheme) {
      const updateThemeBasedOnTime = () => {
        const hours = new Date().getHours();
        // Set dark theme between 6pm (18:00) and 6am (6:00)
        const newTheme: Theme = (hours >= 18 || hours < 6) ? "dark" : "light";
        setTheme(newTheme);
      };
      
      // Update theme immediately
      updateThemeBasedOnTime();
      
      // Update theme every hour
      const interval = setInterval(updateThemeBasedOnTime, 3600000); // 1 hour in milliseconds
      
      return () => clearInterval(interval);
    }
  }, [autoTheme, enableAutoTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    autoTheme,
    setAutoTheme: (auto: boolean) => {
      localStorage.setItem(storageKey + "-auto", auto.toString());
      setAutoTheme(auto);
    }
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

import create from "zustand";

type Apps = "welcome" | "build" | "detect";

interface ThemeStore {
  currentApp: Apps;
  setCurrentApp: (name: Apps) => void;
  colorScheme: "light" | "dark";
  setColorScheme: (name: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  currentApp: "welcome",
  setCurrentApp: (name: Apps) => {
    set(() => ({ currentApp: name }));
  },
  colorScheme: "dark",
  setColorScheme: (name: "light" | "dark") => {
    set(() => ({ colorScheme: name }));
  },
}));

export const themeStore = () => useThemeStore.getState();

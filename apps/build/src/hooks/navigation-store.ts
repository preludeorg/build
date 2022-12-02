import create from "zustand";

interface BeforeInstallEvent {
  prompt(): void;
  userChoice?: Promise<{ outcome: "accepted" }>;
}
interface NavigationStore {
  isInstalled: boolean;
  installer?: BeforeInstallEvent;
  panel: string;
  overlay: string;
  navigate: (panel: string) => void;
  showOverlay: (overlay: string) => void;
  hideOverlay: () => void;
  setInstaller: (event?: unknown) => void;
  setIsInstalled: (installed: boolean) => void;
}

const useNavigationStore = create<NavigationStore>((set) => ({
  isInstalled: false,
  panel: "welcome",
  overlay: "",
  navigate(panel) {
    set(() => ({ panel }));
  },
  showOverlay(overlay) {
    set(() => ({ overlay }));
  },
  hideOverlay() {
    set(() => ({ overlay: "" }));
  },
  setInstaller(installer) {
    set(() => ({ installer: installer as BeforeInstallEvent }));
  },
  setIsInstalled(installed: boolean) {
    set(() => ({ isInstalled: installed }));
  },
}));

export default useNavigationStore;

export const navigatorState = () => useNavigationStore.getState();

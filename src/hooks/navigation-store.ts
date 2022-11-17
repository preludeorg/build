import create from "zustand";

interface BeforeInstallEvent {
  prompt(): void;
  userChoice?: Promise<{ outcome: "accepted" }>;
}
interface NavigationStore {
  installer?: BeforeInstallEvent;
  panel: string;
  overlay: string;
  navigate: (panel: string) => void;
  showOverlay: (overlay: string) => void;
  hideOverlay: () => void;
  setInstaller: (event?: unknown) => void;
}

const useNavigationStore = create<NavigationStore>((set) => ({
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
}));

export default useNavigationStore;

export const navigatorState = () => useNavigationStore.getState();

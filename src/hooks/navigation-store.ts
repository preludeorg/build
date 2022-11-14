import create from "zustand";

interface BeforeInstallEvent {
  prompt(): void;
  userChoice?: Promise<{ outcome: "accepted" }>;
}
interface NavigationStore {
  installer?: BeforeInstallEvent;
  panel: string;
  serverPanelVisible: boolean;
  navigate: (panel: string) => void;
  toggleServerPanel: () => void;
  setInstaller: (event?: unknown) => void;
}

const useNavigationStore = create<NavigationStore>((set) => ({
  panel: "welcome",
  serverPanelVisible: false,
  navigate(panel) {
    set(() => ({ panel }));
  },
  toggleServerPanel() {
    set((state) => ({ serverPanelVisible: !state.serverPanelVisible }));
  },
  setInstaller(installer) {
    set(() => ({ installer: installer as BeforeInstallEvent }));
  },
}));

export default useNavigationStore;

export const navigatorState = () => useNavigationStore.getState();

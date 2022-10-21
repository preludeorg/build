import create from "zustand";

interface NavigationStore {
  panel: string;
  serverPanelVisible: boolean;
  navigate: (panel: string) => void;
  toggleServerPanel: () => void;
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
}));

export default useNavigationStore;

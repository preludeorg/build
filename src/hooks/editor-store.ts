import create from "zustand";
import { Variant } from "../lib/variant";

export interface Tab {
  variant: Variant;
  extension: string;
  buffer: string;
}

function createTab(variant: Variant): Tab {
  return {
    variant,
    extension: variant.name.split(".").pop() ?? "c",
    buffer: variant.code,
  };
}

interface EditorStore {
  tabs: Record<string, Tab>;
  currentTabId: string;
  previousTabId: string;
  buffer: string;
  reset: () => void;
  openTab: (variant: Variant) => void;
  switchTab: (tabId: string) => void;
  closeTab: (tabId: string) => boolean;
  updateCurrentBuffer: (buffer: string) => void;
}

const useEditorStore = create<EditorStore>((set, get) => ({
  tabs: {},
  currentTabId: "",
  previousTabId: "",
  buffer: "",
  openTab(variant) {
    set((state) => {
      const tab = createTab(variant);
      const newTabs = { ...state.tabs, [tab.variant.name]: tab };
      return {
        ...state,
        tabs: newTabs,
        currentTabId: tab.variant.name,
        buffer: tab.buffer,
      };
    });
  },
  reset() {
    set(() => ({
      tabs: {},
      currentTabId: "",
      previousTabId: "",
      buffer: "",
    }));
  },
  switchTab(tabId) {
    set((state) => ({
      currentTabId: tabId,
      previousTabId: state.currentTabId,
      buffer: state.tabs[tabId].buffer,
    }));
  },
  closeTab(tabId) {
    let hasTabs = true;
    set((state) => {
      const newTabs = { ...state.tabs };
      delete newTabs[tabId];

      hasTabs = Object.keys(newTabs).length !== 0;

      if (state.currentTabId === tabId) {
        const nextId =
          state.previousTabId === ""
            ? Object.keys(newTabs)[0]
            : state.previousTabId;

        return {
          tabs: newTabs,
          currentTabId: nextId,
          previousTabId: "",
          buffer: newTabs[nextId]?.buffer ?? "",
        };
      }

      return { tabs: newTabs };
    });

    return hasTabs;
  },
  updateCurrentBuffer(buffer) {
    set((state) => {
      const currentTab = state.tabs[state.currentTabId];

      return {
        tabs: {
          ...state.tabs,
          [state.currentTabId]: { ...currentTab, buffer },
        },
      };
    });
  },
}));

export default useEditorStore;

export const editorState = () => useEditorStore.getState();

export const selectHasTabs = (state: EditorStore) =>
  Object.keys(state.tabs).length !== 0;

export const selectBuffer = (state: EditorStore) => state.buffer;

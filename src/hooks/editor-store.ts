import { Extension } from "@codemirror/state";
import create from "zustand";
import { DCF } from "../lib/dcf";
import { getLanguageMode } from "../lib/lang";

export interface Tab {
  dcf: DCF;
  extensions: Extension[];
  buffer: string;
}

function createTab(dcf: DCF): Tab {
  return {
    dcf,
    extensions: getLanguageMode(dcf.name.split(".").pop() ?? "c").mode(),
    buffer: dcf.code,
  };
}

interface EditorStore {
  tabs: Record<string, Tab>;
  currentTabId: string;
  previousTabId: string;
  buffer: string;
  openTab: (dcf: DCF) => void;
  switchTab: (tabId: string) => void;
  closeTab: (tabId: string) => boolean;
  hasTabs: () => boolean;
  updateCurrentBuffer: (buffer: string) => void;
}

const useEditorStore = create<EditorStore>((set, get) => ({
  tabs: {},
  currentTabId: "",
  previousTabId: "",
  buffer: "",
  openTab(dcf) {
    set((state) => {
      const tab = createTab(dcf);
      const newTabs = { ...state.tabs, [tab.dcf.name]: tab };
      return {
        ...state,
        tabs: newTabs,
        currentTabId: tab.dcf.name,
        buffer: tab.buffer,
      };
    });
  },
  switchTab(tabId) {
    set((state) => ({ currentTabId: tabId, previousTabId: state.currentTabId, buffer: state.tabs[tabId].buffer }));
  },
  closeTab(tabId) {
    let hasTabs = true;
    set((state) => {
      const newTabs = { ...state.tabs };
      delete newTabs[tabId];

      hasTabs = Object.keys(newTabs).length !== 0;

      if (state.currentTabId === tabId) {
        const nextId = state.previousTabId === "" ? Object.keys(newTabs)[0] : state.previousTabId;

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
  hasTabs() {
    return Object.keys(get().tabs).length !== 0;
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

import { Extension } from "@codemirror/state";
import create from "zustand";
import { DCF } from "../lib/dcf";
import { getLanguageMode } from "../lib/lang";

export interface Tab {
  dcf: DCF;
  extension: string;
  buffer: string;
}

function createTab(dcf: DCF): Tab {
  return {
    dcf,
    extension: dcf.name.split(".").pop() ?? "c",
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

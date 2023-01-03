import { isPreludeTest, Test } from "@theprelude/core";
import create from "zustand";

export interface Tab {
  test: Test;
  extension: string;
  buffer: string;
  readonly: boolean;
}

function createTab(test: Test, code: string): Tab {
  return {
    test,
    extension: test.name.split(".").pop() ?? "go",
    buffer: code,
    readonly: isPreludeTest(test),
  };
}

interface EditorStore {
  tabs: Record<string, Tab>;
  currentTabId: string;
  previousTabId: string;
  buffer: string;
  reset: () => void;
  openTab: (test: Test, code: string) => void;
  switchTab: (tabId: string) => void;
  closeTab: (tabId: string) => boolean;
  updateCurrentBuffer: (buffer: string) => void;
}

const useEditorStore = create<EditorStore>((set) => ({
  tabs: {},
  currentTabId: "",
  previousTabId: "",
  buffer: "",
  openTab(test, code) {
    set((state) => {
      const tab = createTab(test, code);
      const newTabs = { ...state.tabs, [tab.test.name]: tab };
      return {
        ...state,
        tabs: newTabs,
        currentTabId: tab.test.name,
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

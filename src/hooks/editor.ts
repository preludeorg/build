import { Extension } from "@codemirror/state";
import { useState, useCallback } from "react";
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

export function useEditor(defaultTabs = {}) {
  const [tabs, setTabs] = useState<Record<string, Tab>>(defaultTabs);
  const [currentTabId, setCurrentTabId] = useState<string>("");
  const [buffer, setBuffer] = useState<string>("");

  const currentTab = tabs[currentTabId];

  const closeTab = (tabId: string) => {
    const newTabs = { ...tabs };
    delete newTabs[tabId];

    setTabs(newTabs);

    if (currentTabId === tabId) {
      const nextId = Object.keys(newTabs)[0];

      if (nextId && newTabs[nextId]) {
        setCurrentTabId(nextId);
        setBuffer(newTabs[nextId].buffer);
      }
    }

    return Object.keys(newTabs).length !== 0;
  };

  const openTab = (dcf: DCF) => {
    const tab = createTab(dcf);
    const newTabs = { ...tabs, [tab.dcf.name]: tab };
    setTabs(newTabs);
    setCurrentTabId(tab.dcf.name);
    setBuffer(tab.buffer);
  };

  const switchTab = (tabId: string) => {
    setCurrentTabId(tabId);
    setBuffer(tabs[tabId].buffer);
  };

  const updateCurrentBuffer = (buffer: string) => {
    setTabs({ ...tabs, [currentTabId]: { ...currentTab, buffer } });
  };

  const hasTabs = Object.keys(tabs).length !== 0;

  return {
    tabs,
    currentTab,
    buffer,
    hasTabs,
    switchTab,
    closeTab,
    openTab,
    updateCurrentBuffer,
  };
}

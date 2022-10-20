import { useState } from "react";
import Editor from "./editor";
import styles from "./editor.module.pcss";
import { DCF } from "../../lib/dcf";
import C from "./lang/c";
import CS from "./lang/cs";
import Swift from "./lang/swift";
import { Extension } from "@codemirror/state";
import { getModeExtensions } from "./state";

interface Tab {
  dcf: DCF;
  extensions: Extension[];
  buffer: string;
}

function createTab(dcf: DCF): Tab {
  return {
    dcf,
    extensions: getModeExtensions(dcf.name.split(".").pop() ?? "c"),
    buffer: dcf.code,
  };
}

const defaultTabs: Tab[] = [
  createTab({ name: "linux-x86-abc232231.c", code: new C().bootstrap() }),
  createTab({ name: "linux-x86-abc232231.cs", code: new CS().bootstrap() }),
  createTab({
    name: "linux-x86-abc232231.swift",
    code: new Swift().bootstrap(),
  }),
];

const EditorWindow: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>(defaultTabs);
  const [currentTabIndex, setCurrentTabIndex] = useState<number>(0);
  const [buffer, setBuffer] = useState<string | null>(null);

  const currentTab = tabs[currentTabIndex];

  console.log(buffer);

  return (
    <div className={styles.window}>
      <nav>
        {tabs.map((tab, index) => (
          <li key={tab.dcf.name}>
            <span
              onClick={() => {
                setCurrentTabIndex(index);
                setBuffer(tabs[index].buffer);
              }}
            >
              {tab.dcf.name}{" "}
            </span>
            <button
              onClick={() => {
                const newTabs = tabs.filter((t) => t.dcf.name !== tab.dcf.name);

                if (currentTabIndex === index) {
                  setCurrentTabIndex(0);
                  setBuffer(newTabs[0].buffer);
                }

                setTabs(newTabs);
              }}
            >
              x
            </button>
          </li>
        ))}
      </nav>
      <Editor
        buffer={buffer ?? currentTab.buffer}
        extensions={currentTab.extensions}
        onChange={(buffer) => {
          setTabs(
            tabs.map((tab, index) => {
              if (currentTabIndex === index) {
                return { ...tab, buffer };
              }

              return tab;
            })
          );
        }}
      />
    </div>
  );
};

export default EditorWindow;

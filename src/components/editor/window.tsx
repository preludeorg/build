import Editor from "./editor";
import ControlPanel from "./control-panel";
import styles from "./editor.module.pcss";
import CloseIcon from "../icons/close-icon";
import AppleIcon from "../icons/apple-icon";
import LinuxIcon from "../icons/linux-icon";
import useEditorStore, { selectBuffer } from "../../hooks/editor-store";
import shallow from "zustand/shallow";
import useNavigationStore from "../../hooks/navigation-store";
import cx from "classnames";
import React from "react";
import { getLanguageMode, getLinters } from "../../lib/lang";
import { lint } from "../../lib/lang/linter";

const EditorWindow: React.FC = () => {
  const tabKeys = useEditorStore((state) => Object.keys(state.tabs), shallow);
  const buffer = useEditorStore(selectBuffer);
  const ext = useEditorStore(
    (state) => state.tabs[state.currentTabId].extension,
    shallow
  );
  const updateBuffer = useEditorStore((state) => state.updateCurrentBuffer);

  const extensions = React.useMemo(() => getLanguageMode(ext).mode(), [ext]);
  const linters = React.useMemo(() => getLinters(ext), [ext]);

  return (
    <div className={styles.window}>
      <nav>
        <ul>
          {tabKeys.map((id) => (
            <Tab key={id} tabId={id} />
          ))}
        </ul>
      </nav>
      <Editor buffer={buffer} extensions={extensions} onChange={updateBuffer} />
      <Linters />
      <ControlPanel />
    </div>
  );
};

export default EditorWindow;

const Tab: React.FC<{ tabId: string }> = ({ tabId }) => {
  const tabName = useEditorStore((state) => state.tabs[tabId].dcf.name);
  const currentTabId = useEditorStore((state) => state.currentTabId);
  const switchTab = useEditorStore((state) => state.switchTab);
  const closeTab = useEditorStore((state) => state.closeTab);
  const navigate = useNavigationStore((state) => state.navigate);
  return (
    <li
      className={cx({ [styles.active]: tabId === currentTabId })}
      onClick={(e) => {
        switchTab(tabId);
      }}
    >
      {tabName.includes("darwin") ? (
        <AppleIcon className={styles.icon} />
      ) : (
        <LinuxIcon className={styles.icon} />
      )}
      <span>{tabName}</span>
      <button
        className={styles.close}
        onClick={(e) => {
          e.stopPropagation();
          const hasTabs = closeTab(tabName);
          if (!hasTabs) {
            navigate("welcome");
          }
        }}
      >
        <CloseIcon />
      </button>
    </li>
  );
};

const Linters: React.FC = () => {
  const messages = useEditorStore((state) => {
    const tab = state.tabs[state.currentTabId];
    return lint(tab.buffer, getLinters(tab.extension));
  }, shallow);

  if (messages.length === 0) return null;

  return (
    <div className={styles.linters}>
      <h3>Problems</h3>
      <ul>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
};

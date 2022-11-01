import Editor from "./editor";
import ControlPanel from "./control-panel";
import styles from "./editor.module.pcss";
import CloseIcon from "../icons/close-icon";
import AppleIcon from "../icons/apple-icon";
import LinuxIcon from "../icons/linux-icon";
import useEditorStore from "../../hooks/editor-store";
import shallow from "zustand/shallow";
import useNavigationStore from "../../hooks/navigation-store";
import cx from "classnames";
import useTerminalStore from "../../hooks/terminal-store";

const EditorWindow: React.FC = () => {
  const tabKeys = useEditorStore((state) => Object.keys(state.tabs), shallow);
  const buffer = useEditorStore((state) => state.buffer);
  const extensions = useEditorStore(
    (state) => state.tabs[state.currentTabId].extensions,
    shallow
  );
  const updateBuffer = useEditorStore((state) => state.updateCurrentBuffer);

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
  const write = useTerminalStore((state) => state.write);
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

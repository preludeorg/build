import Editor from "./editor";
import styles from "./editor.module.pcss";
import CloseIcon from "../icons/close-icon";
import AppleIcon from "../icons/apple-icon";
import LinuxIcon from "../icons/linux-icon";
import useEditorStore from "../../hooks/editor-store";
import shallow from "zustand/shallow";
import useNavigationStore from "../../hooks/navigation-store";

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
    </div>
  );
};

export default EditorWindow;

const Tab: React.FC<{ tabId: string }> = ({ tabId }) => {
  const tabName = useEditorStore((state) => state.tabs[tabId].dcf.name);
  const switchTab = useEditorStore((state) => state.switchTab);
  const closeTab = useEditorStore((state) => state.closeTab);
  const navigate = useNavigationStore((state) => state.navigate);
  return (
    <li
      onClick={(e) => {
        switchTab(tabId);
      }}
    >
      {tabName.startsWith("darwin") ? (
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

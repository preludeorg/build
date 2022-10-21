import Editor from "./editor";
import styles from "./editor.module.pcss";
import CloseIcon from "../icons/close-icon";
import AppleIcon from "../icons/apple-icon";
import LinuxIcon from "../icons/linux-icon";
import { Tab } from "../../hooks/editor";

interface Props {
  tabs: Record<string, Tab>;
  switchTab: (id: string) => void;
  closeTab: (id: string) => boolean;
  buffer: string;
  currentTab: Tab;
  updateBuffer: (buffer: string) => void;
  setNavigation: (n: string) => void;
}

const EditorWindow: React.FC<Props> = ({
  tabs,
  switchTab,
  closeTab,
  buffer,
  currentTab,
  updateBuffer,
  setNavigation,
}) => {
  return (
    <div className={styles.window}>
      <nav>
        <ul>
          {Object.keys(tabs).map((id) => {
            const tab = tabs[id];
            return (
              <li
                onClick={(e) => {
                  switchTab(id);
                }}
                key={tab.dcf.name}
              >
                {tab.dcf.name.startsWith("darwin") ? (
                  <AppleIcon className={styles.icon} />
                ) : (
                  <LinuxIcon className={styles.icon} />
                )}
                <span>{tab.dcf.name}</span>
                <button
                  className={styles.close}
                  onClick={(e) => {
                    e.stopPropagation();
                    const hasTabs = closeTab(id);
                    if (!hasTabs) {
                      setNavigation("welcome");
                    }
                  }}
                >
                  <CloseIcon />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <Editor
        buffer={buffer}
        extensions={currentTab.extensions}
        onChange={updateBuffer}
      />
    </div>
  );
};

export default EditorWindow;

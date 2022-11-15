import Editor from "./editor";
import ControlPanel from "./control-panel";
import styles from "./editor.module.pcss";
import CloseIcon from "../icons/close-icon";
import useEditorStore, { selectBuffer } from "../../hooks/editor-store";
import shallow from "zustand/shallow";
import useNavigationStore from "../../hooks/navigation-store";
import classNames from "classnames";
import React from "react";
import { getLanguage } from "../../lib/lang";
import { lint } from "../../lib/lang/linter";
import { debounce } from "../../lib/utils/debounce";
import useAuthStore, { selectServiceConfig } from "../../hooks/auth-store";
import { Service, ServiceConfig } from "@theprelude/sdk";
import VariantIcon from "../icons/variant-icon";
import { parseVariant } from "../../lib/utils/parse-variant";
import { terminalState } from "../../hooks/terminal-store";

const { showIndicator, hideIndicator } = terminalState();

const saveVariant = async (
  name: string,
  code: string,
  config: ServiceConfig
) => {
  try {
    showIndicator("Auto-saving...");
    const service = new Service(config);
    await service.build.createVariant(name, code);
  } catch (e) {
  } finally {
    hideIndicator();
  }
};

const processVariant = debounce(saveVariant, 1000);

const EditorWindow: React.FC = () => {
  const serviceConfig = useAuthStore(selectServiceConfig, shallow);
  const tabKeys = useEditorStore((state) => Object.keys(state.tabs), shallow);
  const currentTabId = useEditorStore((state) => state.currentTabId);
  const buffer = useEditorStore(selectBuffer);
  const ext = useEditorStore(
    (state) => state.tabs[state.currentTabId].extension,
    shallow
  );
  const updateBuffer = useEditorStore((state) => state.updateCurrentBuffer);

  const extensions = React.useMemo(() => getLanguage(ext).mode, [ext]);

  return (
    <div className={styles.window}>
      <nav>
        <ul>
          {tabKeys.map((id) => (
            <Tab key={id} tabId={id} />
          ))}
        </ul>
      </nav>
      <Editor
        buffer={buffer}
        extensions={extensions}
        onChange={(buffer) => {
          updateBuffer(buffer);
          processVariant(currentTabId, buffer, serviceConfig);
        }}
      />
      <Linters />
      <ControlPanel />
    </div>
  );
};

export default EditorWindow;

const Tab: React.FC<{ tabId: string }> = ({ tabId }) => {
  const tabName = useEditorStore((state) => state.tabs[tabId].variant.name);
  const currentTabId = useEditorStore((state) => state.currentTabId);
  const switchTab = useEditorStore((state) => state.switchTab);
  const closeTab = useEditorStore((state) => state.closeTab);
  const navigate = useNavigationStore((state) => state.navigate);
  const { id, platform } = parseVariant(tabName) ?? { id: "" };
  return (
    <li
      className={classNames({ [styles.active]: tabId === currentTabId })}
      onClick={(e) => {
        switchTab(tabId);
      }}
    >
      <VariantIcon platform={platform} className={styles.icon} />
      <span className={styles.truncate}>{id}</span>
      <span>{tabName.replace(id, "")}</span>
      <div className={styles.closeContainer}>
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
      </div>
    </li>
  );
};

const Linters: React.FC = () => {
  const messages = useEditorStore((state) => {
    const tab = state.tabs[state.currentTabId];
    return lint(tab.buffer, getLanguage(tab.extension).linters);
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

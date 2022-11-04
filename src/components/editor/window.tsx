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
import { lint, validate } from "../../lib/lang/linter";
import { debounce } from "../../lib/utils/debounce";
import useAuthStore, { selectServiceConfig } from "../../hooks/auth-store";
import { Service, ServiceConfig } from "@theprelude/sdk";

const saveVariant = async (
  name: string,
  code: string,
  config: ServiceConfig
) => {
  try {
    const service = new Service(config);
    await service.build.createVariant(name, code);
  } catch (e) {}
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
      <Editor
        buffer={buffer}
        extensions={extensions}
        onChange={(buffer) => {
          updateBuffer(buffer);
          const isValid = validate(buffer, linters);
          if (isValid) {
            processVariant(currentTabId, buffer, serviceConfig);
          }
        }}
      />
      <Linters />
      <ControlPanel />
    </div>
  );
};

export default EditorWindow;

const uuidRegex = new RegExp(
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/
);

const Tab: React.FC<{ tabId: string }> = ({ tabId }) => {
  const tabName = useEditorStore((state) => state.tabs[tabId].variant.name);
  const currentTabId = useEditorStore((state) => state.currentTabId);
  const switchTab = useEditorStore((state) => state.switchTab);
  const closeTab = useEditorStore((state) => state.closeTab);
  const navigate = useNavigationStore((state) => state.navigate);
  const uuid = tabName.match(uuidRegex)?.[0] ?? "";
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
      <span className={styles.truncate}>{uuid}</span>
      <span>{tabName.replace(uuid, "")}</span>
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

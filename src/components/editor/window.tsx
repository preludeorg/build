import { ServiceConfig } from "@theprelude/sdk";
import classNames from "classnames";
import React from "react";
import shallow from "zustand/shallow";
import useAuthStore from "../../hooks/auth-store";
import useEditorStore, { selectBuffer } from "../../hooks/editor-store";
import useNavigationStore from "../../hooks/navigation-store";
import { terminalState } from "../../hooks/terminal-store";
import { createVariant } from "../../lib/api";
import { getLanguage } from "../../lib/lang";
import { lint } from "../../lib/lang/linter";
import { debounce } from "../../lib/utils/debounce";
import { parseVariant } from "../../lib/utils/parse-variant";
import { select } from "../../lib/utils/select";
import IconButton from "../ds/button/icon-button";
import CloseIcon from "../ds/icons/close-icon";
import VariantIcon from "../ds/icons/variant-icon";
import { notifyError } from "../notifications/notifications";
import ControlPanel from "./control-panel";
import Editor from "./editor";
import styles from "./editor.module.pcss";

const { showIndicator, hideIndicator } = terminalState();

const saveVariant = async (
  name: string,
  code: string,
  config: ServiceConfig
) => {
  try {
    showIndicator("auto-saving...");
    await createVariant({ name, code }, config, new AbortController().signal);
  } catch (e) {
    notifyError("Failed to auto-save", e);
  } finally {
    hideIndicator();
  }
};

const processVariant = debounce(saveVariant, 1000);

const EditorWindow: React.FC = () => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const tabKeys = useEditorStore((state) => Object.keys(state.tabs), shallow);
  const { currentTabId, ext, buffer, updateBuffer } = useEditorStore(
    (state) => ({
      currentTabId: state.currentTabId,
      ext: state.tabs[state.currentTabId].extension,
      updateBuffer: state.updateCurrentBuffer,
      buffer: selectBuffer(state),
    }),
    shallow
  );

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
          void processVariant(currentTabId, buffer, serviceConfig);
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
  const { currentTabId, switchTab, closeTab } = useEditorStore(
    select("currentTabId", "switchTab", "closeTab"),
    shallow
  );
  const navigate = useNavigationStore((state) => state.navigate);
  const { id, platform } = parseVariant(tabName) ?? { id: "" };
  return (
    <li
      className={classNames({ [styles.active]: tabId === currentTabId })}
      onClick={() => {
        switchTab(tabId);
      }}
    >
      <VariantIcon platform={platform} className={styles.icon} />
      <span className={styles.truncate}>{id}</span>
      <span>{tabName.replace(id, "")}</span>
      <div className={styles.closeContainer}>
        <IconButton
          className={styles.iconButton}
          onClick={(e) => {
            e.stopPropagation();
            const hasTabs = closeTab(tabName);
            if (!hasTabs) {
              navigate("welcome");
            }
          }}
          intent={"primary"}
          icon={<CloseIcon />}
        />
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

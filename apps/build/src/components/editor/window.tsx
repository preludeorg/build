import { EditorState } from "@codemirror/state";
import {
  createVariant,
  debounce,
  parseVariant,
  select,
  useAuthStore,
} from "@theprelude/core";
import { CloseIcon, IconButton, VariantIcon } from "@theprelude/ds";
import { ServiceConfig } from "@theprelude/sdk";
import classNames from "classnames";
import React from "react";
import shallow from "zustand/shallow";
import useEditorStore, { selectBuffer } from "../../hooks/editor-store";
import useNavigationStore from "../../hooks/navigation-store";
import { terminalState } from "../../hooks/terminal-store";
import { getLanguage } from "../../lib/lang";
import { lint } from "../../lib/lang/linter";
import LockedTest from "../locked-test/locked-test";
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
  const tabs = useEditorStore(
    (state) =>
      Object.keys(state.tabs).map((key) => {
        return {
          id: state.tabs[key].variant.name,
          readonly: state.tabs[key].variant.readonly ?? false,
        };
      }),
    shallow
  );
  const { currentTabId, ext, buffer, updateBuffer, readonly } = useEditorStore(
    (state) => ({
      currentTabId: state.currentTabId,
      ext: state.tabs[state.currentTabId].extension,
      updateBuffer: state.updateCurrentBuffer,
      buffer: selectBuffer(state),
      readonly: state.tabs[state.currentTabId].variant.readonly ?? false,
    }),
    shallow
  );

  const extensions = React.useMemo(
    () => [...getLanguage(ext).mode, EditorState.readOnly.of(readonly)],
    [ext, readonly]
  );

  return (
    <div className={styles.window}>
      <nav>
        <ul>
          {tabs.map((tab) => (
            <Tab key={tab.id} readonly={tab.readonly} tabId={tab.id} />
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

const Tab: React.FC<{ tabId: string; readonly: boolean }> = ({
  tabId,
  readonly,
}) => {
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
      {readonly && <LockedTest showTooltip={false} />}
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

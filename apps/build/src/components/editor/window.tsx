import { EditorState } from "@codemirror/state";
import { debounce, select, uploadTest, useAuthStore } from "@theprelude/core";
import {
  CloseIcon,
  IconButton,
  notifyError,
  VariantIcon,
} from "@theprelude/ds";
import { ServiceConfig } from "@theprelude/sdk";
import classNames from "classnames";
import React from "react";
import shallow from "zustand/shallow";
import useEditorStore, { selectBuffer } from "../../hooks/editor-store";
import useNavigationStore from "../../hooks/navigation-store";
import { getLanguage } from "../../lib/lang";
import { lint } from "../../lib/lang/linter";
import ControlPanel from "./control-panel";
import Editor from "./editor";
import styles from "./editor.module.pcss";

const updateCode = async (
  name: string,
  code: string,
  config: ServiceConfig
) => {
  try {
    await uploadTest(name, code, config, new AbortController().signal);
  } catch (e) {
    notifyError("Failed to auto-save", e);
  } finally {
  }
};

const processCode = debounce(updateCode, 1000);

const EditorWindow: React.FC = () => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const tabs = useEditorStore(
    (state) =>
      Object.keys(state.tabs).map((key) => state.tabs[key].test.filename),
    shallow
  );
  const { currentTabId, ext, buffer, updateBuffer, readonly } = useEditorStore(
    (state) => ({
      currentTabId: state.currentTabId,
      ext: state.tabs[state.currentTabId].extension,
      updateBuffer: state.updateCurrentBuffer,
      buffer: selectBuffer(state),
      readonly: state.tabs[state.currentTabId].readonly ?? false,
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
            <Tab key={tab} tabId={tab} />
          ))}
        </ul>
      </nav>
      <Editor
        buffer={buffer}
        extensions={extensions}
        onChange={(buffer) => {
          updateBuffer(buffer);
          void processCode(currentTabId, buffer, serviceConfig);
        }}
      />
      <Linters />
      <ControlPanel />
    </div>
  );
};

export default EditorWindow;

const Tab: React.FC<{ tabId: string }> = ({ tabId }) => {
  const tabName = useEditorStore((state) => state.tabs[tabId].test.rule);
  const { currentTabId, switchTab, closeTab } = useEditorStore(
    select("currentTabId", "switchTab", "closeTab"),
    shallow
  );
  const navigate = useNavigationStore((state) => state.navigate);
  return (
    <li
      className={classNames({ [styles.active]: tabId === currentTabId })}
      onClick={() => {
        switchTab(tabId);
      }}
    >
      <VariantIcon className={styles.icon} />
      <span className={styles.truncate}>{tabName}</span>
      <div className={styles.closeContainer}>
        <IconButton
          className={styles.iconButton}
          onClick={(e) => {
            e.stopPropagation();
            const hasTabs = closeTab(tabId);
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

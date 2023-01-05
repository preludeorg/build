import { Button, PlayIcon } from "@theprelude/ds";
import shallow from "zustand/shallow";
import useEditorStore from "../../hooks/editor-store";
import { getLanguage } from "../../lib/lang";
import { validate } from "../../lib/lang/linter";
import styles from "./control-panel.module.css";

const ControlPanel: React.FC<{ build: () => void; loading: boolean }> = ({
  build,
  loading,
}) => {
  const { validTest, currentTabId, readonly } = useEditorStore((state) => {
    const tab = state.tabs[state.currentTabId];
    return {
      validTest: validate(tab.buffer, getLanguage(tab.extension).linters),
      currentTabId: state.currentTabId,
      readonly: tab.readonly,
    };
  }, shallow);

  return (
    <div className={styles.controlPanel}>
      {!readonly && (
        <Button
          onClick={build}
          intent={"success"}
          icon={<PlayIcon />}
          disabled={!validTest || loading}
          loading={loading}
        >
          Build
        </Button>
      )}
    </div>
  );
};

export default ControlPanel;

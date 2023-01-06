import { select } from "@theprelude/core";
import { Button, PlayIcon } from "@theprelude/ds";
import shallow from "zustand/shallow";
import useEditorStore from "../../hooks/editor-store";
import useIntroStore from "../../hooks/intro-store";
import { getLanguage } from "../../lib/lang";
import { validate } from "../../lib/lang/linter";
import { driver } from "../driver/driver";
import styles from "./control-panel.module.css";

const ControlPanel: React.FC<{ build: () => void; loading: boolean }> = ({
  build,
  loading,
}) => {
  const { markCompleted } = useIntroStore(select("markCompleted"), shallow);
  const { validTest, readonly } = useEditorStore((state) => {
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
          data-tooltip-id="build-test"
          onClick={() => {
            markCompleted("buildTest");
            driver.reset();
            build();
          }}
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

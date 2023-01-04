import { buildTest, listTests, select, useAuthStore } from "@theprelude/core";
import { Button, PlayIcon } from "@theprelude/ds";
import { useState } from "react";
import shallow from "zustand/shallow";
import useEditorStore from "../../hooks/editor-store";
import { getLanguage } from "../../lib/lang";
import { validate } from "../../lib/lang/linter";
import styles from "./control-panel.module.css";

const ControlPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const { validTest, currentTabId, readonly } = useEditorStore((state) => {
    const tab = state.tabs[state.currentTabId];
    return {
      validTest: validate(tab.buffer, getLanguage(tab.extension).linters),
      currentTabId: state.currentTabId,
      readonly: tab.readonly,
    };
  }, shallow);

  const handleBuild = async () => {
    try {
      setLoading(true);

      const results = await buildTest(currentTabId, serviceConfig);

      console.log(results);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.controlPanel}>
      {!readonly && (
        <Button
          onClick={handleBuild}
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

import PlayIcon from "../icons/play-icon";

import styles from "./control-panel.module.css";
import useEditorStore from "../../hooks/editor-store";
import { validate } from "../../lib/lang/linter";
import { getLanguage } from "../../lib/lang";
import useTerminalStore from "../../hooks/terminal-store";
import shallow from "zustand/shallow";
import useAuthStore from "../../hooks/auth-store";
import { select } from "../../lib/utils/select";
import { build } from "../../lib/api";
import LoaderIcon from "../icons/loader-icon";
import { useState } from "react";
import VariantResults from "../terminal/variant-results";

const ControlPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const { validTest, currentTabId } = useEditorStore((state) => {
    const tab = state.tabs[state.currentTabId];

    return {
      validTest: validate(tab.buffer, getLanguage(tab.extension).linters),
      currentTabId: state.currentTabId,
    };
  }, shallow);

  const { write, showIndicator, hideIndicator } = useTerminalStore(
    select("write", "showIndicator", "hideIndicator")
  );

  const handleBuild = async () => {
    try {
      setLoading(true);
      showIndicator("Building...");
      const results = await build(currentTabId, serviceConfig);
      write(<VariantResults results={results} />);
    } catch (e) {
    } finally {
      setLoading(false);
      hideIndicator();
    }
  };

  return (
    <div className={styles.controlPanel}>
      <button
        onClick={handleBuild}
        disabled={!validTest || loading}
        className={styles.test}
      >
        {loading ? <LoaderIcon className={styles.loaderIcon} /> : <PlayIcon />}
        <span>Build</span>
      </button>
    </div>
  );
};

export default ControlPanel;

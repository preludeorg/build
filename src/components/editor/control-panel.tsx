import { useState } from "react";
import shallow from "zustand/shallow";
import useAuthStore from "../../hooks/auth-store";
import useEditorStore from "../../hooks/editor-store";
import useTerminalStore from "../../hooks/terminal-store";
import { build } from "../../lib/api";
import { getLanguage } from "../../lib/lang";
import { validate } from "../../lib/lang/linter";
import { select } from "../../lib/utils/select";
import LoaderIcon from "../icons/loader-icon";
import PlayIcon from "../icons/play-icon";
import { ErrorMessage } from "../terminal/terminal-message";
import VariantResults from "../terminal/variant-results";
import styles from "./control-panel.module.css";

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

  const { write, showIndicator, hideIndicator, currentTest } = useTerminalStore(
    select("write", "showIndicator", "hideIndicator", "currentTest")
  );

  const handleBuild = async () => {
    try {
      setLoading(true);
      showIndicator("Building...");
      const results = await build(currentTabId, serviceConfig);

      if (!currentTest) {
        throw new Error("missing test");
      }

      write(
        <VariantResults question={currentTest.question} results={results} />
      );
    } catch (e) {
      write(<ErrorMessage message={`failed to build variant`} />);
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

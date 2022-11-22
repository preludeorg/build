import { useState } from "react";
import shallow from "zustand/shallow";
import useAuthStore from "../../hooks/auth-store";
import useEditorStore from "../../hooks/editor-store";
import useTerminalStore from "../../hooks/terminal-store";
import { build, getTestList } from "../../lib/api";
import { getLanguage } from "../../lib/lang";
import { validate } from "../../lib/lang/linter";
import { parseVariant } from "../../lib/utils/parse-variant";
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

  const { write, showIndicator, hideIndicator, takeControl } = useTerminalStore(
    select(
      "write",
      "showIndicator",
      "hideIndicator",
      "takeControl"
    )
  );

  const handleBuild = async () => {
    try {
      setLoading(true);
      showIndicator("Building...");
      const signal = takeControl().signal;
      const results = await build(currentTabId, serviceConfig);
      const test = (await getTestList(serviceConfig, signal)).find(
        (t) => t.id === parseVariant(currentTabId)?.id
      );

      if (!test) {
        throw new Error("missing test");
      }

      write(<VariantResults question={test.question} results={results} />);
    } catch (e) {
      write(
        <ErrorMessage
          message={`failed to build variant: ${(e as Error).message}`}
        />
      );
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

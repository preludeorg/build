import PlayIcon from "../icons/play-icon";
import ChevronIcon from "../icons/chevron-icon";
import HelpIcon from "../icons/help-icon";
import CopyIcon from "../icons/copy-icon";
import styles from "./control-panel.module.css";
import useEditorStore from "../../hooks/editor-store";
import { useState } from "react";
import classNames from "classnames";
import VariantIcon from "../icons/variant-icon";
import { parseVariant } from "../../lib/utils/parse-variant";
import { validate } from "../../lib/lang/linter";
import { getLanguage } from "../../lib/lang";

const ControlPanel: React.FC = ({}) => {
  const validTest = useEditorStore((state) => {
    const tab = state.tabs[state.currentTabId];

    return validate(tab.buffer, getLanguage(tab.extension).linters);
  });

  const currentTabId = useEditorStore((state) => state.currentTabId);
  const [overlayVisible, setOverlayVisible] = useState(false);
  return (
    <div className={styles.controlPanel}>
      <button disabled={!validTest} className={styles.test}>
        <PlayIcon className={styles.playIcon} />
        <span>Test</span>
      </button>
      <div className={styles.deployContainer}>
        <button
          className={styles.deploy}
          onClick={() => setOverlayVisible(!overlayVisible)}
        >
          <span>Deploy</span>
          <ChevronIcon
            className={classNames(styles.chevronIcon, {
              [styles.activeChevron]: overlayVisible === true,
            })}
          />
        </button>
        {overlayVisible ? (
          <div className={styles.overlay}>
            <div className={styles.headline}>
              <span className={styles.target}>Deploy on</span>
              <VariantIcon
                platform={parseVariant(currentTabId)?.platform}
                className={styles.platformIcon}
              />
              <HelpIcon className={styles.helpIcon} />
            </div>
            <span className={styles.description}>
              Use curl or wget to deploy the Detect node on your instance.
            </span>
            <div className={styles.download}>
              <div className={styles.link}>This is the linkja jajjajaa</div>
              <div className={styles.copyContainer}>
                <CopyIcon className={styles.copyIcon} />
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default ControlPanel;

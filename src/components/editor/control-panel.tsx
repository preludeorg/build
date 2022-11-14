import PlayIcon from "../icons/play-icon";
import ChevronIcon from "../icons/chevron-icon";
import HelpIcon from "../icons/help-icon";
import CopyIcon from "../icons/copy-icon";
import styles from "./control-panel.module.css";
import useEditorStore from "../../hooks/editor-store";
import { useState } from "react";
import classNames from "classnames";
import VariantIcon from "../icons/variant-icon";

const ControlPanel: React.FC = () => {
  const currentTabId = useEditorStore((state) => state.currentTabId);
  const [overlayVisible, setOverlayVisible] = useState(false);
  return (
    <div className={styles.controlPanel}>
      <button className={styles.test}>
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
                variantName={currentTabId}
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

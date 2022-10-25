import PlayIcon from "../icons/play-icon";
import ChevronIcon from "../icons/chevron-icon";
import styles from "./editor.module.pcss";

const ControlPanel: React.FC = () => {
  return (
    <div className={styles.controlPanel}>
      <button className={styles.test}>
        <PlayIcon className={styles.playIcon} />
        <span>Test</span>
      </button>
      <button className={styles.deploy}>
        <span>Deploy</span>
        <ChevronIcon className={styles.chevronIcon} />
      </button>
    </div>
  );
};

export default ControlPanel;

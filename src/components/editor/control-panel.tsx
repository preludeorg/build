import PlayIcon from "../icons/play-icon";
import ChevronIcon from "../icons/chevron-icon";
import styles from "./editor.module.pcss";
import useAuthStore from "../../hooks/auth-store";
import useEditorStore from "../../hooks/editor-store";

const ControlPanel: React.FC = () => {
  const deploy = useAuthStore((state) => state.deploy);
  const currentTabId = useEditorStore((state) => state.currentTabId);

  const deployDCF = async () => {
    const delpoyResult = await deploy(currentTabId);
  };

  return (
    <div className={styles.controlPanel}>
      <button className={styles.test}>
        <PlayIcon className={styles.playIcon} />
        <span>Test</span>
      </button>
      <button className={styles.deploy} onClick={deployDCF}>
        <span>Deploy</span>
        <ChevronIcon className={styles.chevronIcon} />
      </button>
    </div>
  );
};

export default ControlPanel;

import LockIcon from "../ds/icons/lock-icon";
import Tootip from "../ds/tooltip/tooltip";
import styles from "./locked-test.module.css";

const LockedTest: React.FC<{
  showTooltip: boolean;
  tooltipPosition?: "top" | "bottom";
}> = ({ tooltipPosition = "top", showTooltip = true }) => {
  return (
    <Tootip
      show={showTooltip}
      position={tooltipPosition}
      message="Test is immutable"
    >
      <LockIcon className={styles.lock} />
    </Tootip>
  );
};

export default LockedTest;

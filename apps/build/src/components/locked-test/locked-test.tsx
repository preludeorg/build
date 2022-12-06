import { LockIcon, Tooltip } from "@theprelude/ds";
import styles from "./locked-test.module.css";

const LockedTest: React.FC<{
  showTooltip: boolean;
  tooltipPosition?: "top" | "bottom";
}> = ({ tooltipPosition = "top", showTooltip = true }) => {
  return (
    <Tooltip
      show={showTooltip}
      position={tooltipPosition}
      message="Test is immutable"
    >
      <LockIcon className={styles.lock} />
    </Tooltip>
  );
};

export default LockedTest;

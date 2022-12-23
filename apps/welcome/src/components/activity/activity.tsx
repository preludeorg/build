import { Probe } from "@theprelude/core";
import { LinuxIcon } from "@theprelude/ds";
import styles from "./activity.module.css";

const Activity: React.FC<{ probe: Probe }> = ({ probe }) => {
  return (
    <div className={styles.activity}>
      <div className={styles.probe}>
        <LinuxIcon />
        <span>{`Probe Platform - ${probe.endpoint_id}`}</span>
        <div></div> {/* Probe status */}
      </div>
      <div className={styles.title}>
        <h2>Can we exploit the Office macro CVEs?</h2>
        <span>{`Executed `}</span>
      </div>
    </div>
  );
};

export default Activity;

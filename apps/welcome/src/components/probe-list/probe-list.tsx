import { Button, DarwinIcon, PlusIcon } from "@theprelude/ds";
import styles from "./probe-list.module.css";
const ProbeList: React.FC<{ probes?: {} }> = ({ probes }) => {
  return (
    <div className={styles.list}>
      <Button className={styles.add} icon={<PlusIcon />}>
        Add a probe
      </Button>
      <Button className={styles.probe} icon={<DarwinIcon />}>
        Test123
      </Button>
    </div>
  );
};

export default ProbeList;

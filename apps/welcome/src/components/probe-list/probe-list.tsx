import { Probe } from "@theprelude/core";
import { Button, PlusIcon, ProbeStatusIcon } from "@theprelude/ds";
import styles from "./probe-list.module.css";

const ProbeList: React.FC<{
  probes: {
    data: Probe[] | undefined;
    isLoading: boolean;
  };
  setScreen: (s: string) => void;
  setProbe: ({}) => void;
}> = ({ probes, setScreen, setProbe }) => {
  return (
    <div className={styles.list}>
      <span className={styles.title}>Probes</span>
      <Button
        className={styles.add}
        onClick={() => setScreen("tutorial")}
        icon={<PlusIcon />}
      >
        Add a probe
      </Button>
      {probes.data?.map((probe) => (
        <Probes probe={probe} setScreen={setScreen} setProbe={setProbe} />
      ))}
    </div>
  );
};

const Probes: React.FC<{
  probe: Probe;
  setScreen: (s: string) => void;
  setProbe: ({}) => void;
}> = ({ probe, setScreen, setProbe }) => {
  const checkStatus = (probeTime: string) => {
    const date = new Date().getTime();
    const probeDate = new Date(probeTime).getTime();
    const difference = (date - probeDate) / 3600000;
    if (difference > 12.25) {
      return "inactive";
    } else {
      return "active";
    }
  };

  const handleClick = () => {
    setScreen("activity");
    setProbe(probe);
  };
  return (
    <Button
      key={probe.endpoint_id}
      className={styles.probe}
      onClick={handleClick}
      icon={<ProbeStatusIcon />}
      extraIcon={
        <div
          className={
            checkStatus(probe.updated) === "active"
              ? styles.active
              : styles.inactive
          }
        ></div>
      }
    >
      {probe.endpoint_id}
    </Button>
  );
};

export default ProbeList;

import { Probe } from "@theprelude/core";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { useActivity } from "../hooks/use-activity";
import { useProbes } from "../hooks/use-probes";
import Activity from "./activity/activity";
import styles from "./app.module.css";
import ProbeList from "./probe-list/probe-list";
import Tutorial from "./tutorial/tutorial";

export default function Welcome() {
  const [screen, setScreen] = useState("tutorial");
  const [probe, setProbe] = useState<Probe | undefined>();
  const probes = useProbes();
  const activity = useActivity();
  return (
    <div className={styles.welcome}>
      <Helmet>
        <title>Prelude | Welcome</title>
      </Helmet>
      {screen === "tutorial" ? (
        <Tutorial />
      ) : (
        <Activity probe={probe} activity={activity} />
      )}
      <ProbeList probes={probes} setScreen={setScreen} setProbe={setProbe} />
    </div>
  );
}

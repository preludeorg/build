import { Helmet } from "react-helmet";
import styles from "./app.module.css";
import Tutorial from "./tutorial/tutorial";
import { useProbes } from "../hooks/use-probes";
import { useActivity } from "../hooks/use-activity";
import ProbeList from "./probe-list/probe-list";
import { useState } from "react";
import Activity from "./activity/activity";

export default function Welcome() {
  const [screen, setScreen] = useState("tutorial");
  const [probe, setProbe] = useState({});
  const probes = useProbes();
  const activity = useActivity();
  return (
    <div className={styles.welcome}>
      <Helmet>
        <title>Prelude | Welcome</title>
        <style>
          {
            "body {  background-color: #1a2121; } :root {--color-border: var(--color-detail-light); --color-primary-20: #344B4B; --color-secondary-10: #669393; }"
          }
        </style>
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

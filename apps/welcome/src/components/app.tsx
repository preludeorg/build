import { Helmet } from "react-helmet";
import styles from "./app.module.css";
import { changePallete } from "@theprelude/core";
import Tutorial from "./tutorial/tutorial";
import { useProbes } from "../hooks/use-probes";
import { useActivity } from "../hooks/use-activity";
import ProbeList from "./probe-list/probe-list";
import { useState } from "react";
import Activity from "./activity/activity";

export default function Welcome() {
  changePallete("welcome");
  const [screen, setScreen] = useState("tutorial");
  const [probe, setProbe] = useState({});
  const probes = useProbes();
  const activity = useActivity();
  console.log(probes)
  return (
    <div className={styles.welcome}>
      <Helmet>
        <title>Prelude | Welcome</title>
        <style>{"body {  background-color: #1a2121; }"}</style>
      </Helmet>
      {screen === "tutorial" ? <Tutorial /> : <Activity probe={probe} />}
      {probes?.data && probes?.data.length > 0 && (
        <ProbeList probes={probes} setScreen={setScreen} setProbe={setProbe} />
      )}
    </div>
  );
}

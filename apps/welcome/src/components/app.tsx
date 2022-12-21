import { Helmet } from "react-helmet";
import styles from "./app.module.css";
import { changePallete } from "@theprelude/core";
import Tutorial from "./tutorial/tutorial";
import { useProbes } from "../hooks/use-probes";
import ProbeList from "./probe-list/probe-list";

export default function Welcome() {
  changePallete("welcome");
  const probes = useProbes();
  return (
    <div className={styles.welcome}>
      <Helmet>
        <title>Prelude | Welcome</title>
        <style>{"body {  background-color: #1a2121; }"}</style>
      </Helmet>
      <Tutorial />
      <ProbeList probes={probes}/>
    </div>
  );
}

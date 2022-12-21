import { Helmet } from "react-helmet";
import styles from "./app.module.css";
import { changePallete } from "@theprelude/core";
import Tutorial from "./tutorial/tutorial";

export default function Welcome() {
  changePallete("welcome");
  return (
    <div className={styles.welcome}>
      <Helmet>
        <title>Prelude | Welcome</title>
        <style>{"body {  background-color: #1a2121; }"}</style>
      </Helmet>
      <Tutorial />
    </div>
  );
}

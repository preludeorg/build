import { Helmet } from "react-helmet";
import styles from "./app.module.css";

export default function Welcome() {
  return (
    <div className={styles.welcome}>
      <Helmet>
        <title>Prelude | Welcome</title>
        <style>{"body {  background-color: #1a2121; }"}</style>
      </Helmet>

      <h1>Actionable Threat Intelligence</h1>
    </div>
  );
}

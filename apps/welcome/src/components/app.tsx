import { Helmet } from "react-helmet";
import styles from "./app.module.css";

export default function Welcome() {
  return (
    <div className={styles.welcome}>
      <Helmet>
        <title>Prelude | Welcome</title>
        <style>{"body {  background-color: #1a2121; }"}</style>
      </Helmet>
      <section className={styles.leftSection}>
        <h2>Actionable Threat Intelligence</h2>
      </section>
      <div className={styles.sectionDivider} />
      <section className={styles.rightSection}></section>
    </div>
  );
}

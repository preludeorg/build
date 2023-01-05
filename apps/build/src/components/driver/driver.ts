import Driver from "driver.js";
import styles from "./driver.module.css";

export const driver = new Driver({
  className: styles.driver,
  stageBackground: "rgba(30, 30, 30, 0.75)",
  showButtons: false,
});

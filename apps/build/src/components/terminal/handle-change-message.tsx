import { useConfig } from "@theprelude/core";
import styles from "./commands.module.css";

const HandleChangeMessage = () => {
  const { handleExport } = useConfig();

  return (
    <div className={styles.handleChangeMessage}>
      <br />
      handle and credentials changed.
      <span className={styles.helpText}>
        <a
          onClick={() => {
            void handleExport();
          }}
        >
          click here
        </a>{" "}
        to backup your new credentials
      </span>
    </div>
  );
};

export default HandleChangeMessage;

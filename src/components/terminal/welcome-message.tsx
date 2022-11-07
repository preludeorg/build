import { Credentials } from "@theprelude/sdk";
import styles from "./commands.module.css";

const WelcomeMessage: React.FC<{ host: string; credentials?: Credentials }> = ({
  host,
  credentials,
}) => {
  if (host && credentials) {
    return (
      <div className={styles.welcomeMessage}>
        Welcome to Prelude Build
        <br />
        <br />
        Connected to {host}
        <br />
        <br />
        <span className={styles.helpText}>
          type "list-tests" to show all your tests
        </span>
      </div>
    );
  }
  return (
    <div className={styles.welcomeMessage}>
      Welcome to Prelude Build
      <br />
      <br />
      <span className={styles.helpText}>
        type "use {`<handle>`}" to get started
      </span>
    </div>
  );
};

export default WelcomeMessage;

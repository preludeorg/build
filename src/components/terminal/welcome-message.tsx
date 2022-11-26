import { Credentials } from "@theprelude/sdk";
import { useConfig } from "../../hooks/use-config";
import styles from "./commands.module.css";

const WelcomeMessage: React.FC<{ host: string; credentials?: Credentials }> = ({
  host,
  credentials,
}) => {
  const { handleImport } = useConfig();

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
        already have an account?{" "}
        <a
          onClick={() => {
            void handleImport();
          }}
        >
          click here
        </a>{" "}
        to import it
      </span>
      <br />
      <br />
      <span className={styles.helpText}>
        or type "use" to create a new account
      </span>
    </div>
  );
};

export default WelcomeMessage;

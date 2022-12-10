import { Credentials, useConfig } from "@theprelude/core";
import styles from "./commands.module.css";

const WelcomeMessage: React.FC<{
  host: string;
  credentials?: Credentials;
  isAnonymous?: boolean;
}> = ({ host, credentials, isAnonymous }) => {
  const { handleImport } = useConfig();

  if (host && credentials && !isAnonymous) {
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
      Connected to {host}
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
        to import credentials
      </span>
      <br />
      <br />
      <span className={styles.helpText}>
        type "list-tests" to show all your tests
      </span>
    </div>
  );
};

export default WelcomeMessage;

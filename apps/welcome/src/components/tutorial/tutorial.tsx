import {
  Button,
  CheckmarkIcon,
  GithubIcon,
  InputGroup,
  PulseSmallIcon,
  RefreshIcon,
} from "@theprelude/ds";
import styles from "./tutorial.module.css";

const Tutorial = () => {
  return (
    <div className={styles.tutorial}>
      <div className={styles.headline}>
        <h3>Welcome to Prelude</h3>
        <p>
          We help organizations know if their most important endpoints are
          vulnerable to the latest exploits. We do that by running continuous
          security tests against production endpoints - no matter where they
          are. This test was designed by the Prelude team to gather intelligence
          from any Windows, Darwin or Linux endpoint and measure whether your
          defenses are protecting your endpoints correctly.
        </p>
      </div>
      <div className={styles.test}>
        <h2>Will your computer quarantine a malicious Office document?</h2>
        <div>
          <span>Rule</span>
          <p>Malicious files should quarantine when written to disk.</p>
        </div>

        <div>
          <span>Test</span>
          <p>Will your computer quarantine a malicious Office document?</p>
        </div>
      </div>
      <div className={styles.execute}>
        <p>Create an endpoint to begin executing the security test:</p>
        <div className={styles.command}>
          <InputGroup
            groupClassName={styles.create}
            placeholder="Enter a name for the endpoint"
            type="text"
          />
          <Button>Create</Button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;

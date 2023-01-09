import styles from "./tutorial.module.css";
import {
  Button,
  CheckmarkIcon,
  GithubIcon,
  InputGroup,
  PulseSmallIcon,
  RefreshIcon,
} from "@theprelude/ds";

const Tutorial = () => {
  const testName = <>Can we exploit the Office macro CVEs?</>;
  const testDescription = (
    <>
      LockBit 2.0 is an affiliate-based Ransomware-as-a-Service (RaaS) that was
      first observed in June 2021. This chain simulates post-exploitation
      activity of LockBit, including deleting Volume Shadow Copies, performing a
      UAC bypass, creating a named pipe, and writing a ransom note to the user's
      desktop. Endpoint detection should identify LockBit 2.0 ransomware
      activity and respond before it can cause damage. This chain must be run as
      Administrator.
    </>
  );
  const test = <>Check for macro-enabled documents</>;
  return (
    <div className={styles.tutorial}>
      <div className={styles.headline}>
        <PulseSmallIcon className={styles.pulse} />
        <h4>Verified Security Test</h4>
      </div>
      <div className={styles.test}>
        <h2>{testName}</h2>
        <p>{testDescription}</p>
        <div className={styles.subTests}>
          <div className={styles.subTest}>
            <CheckmarkIcon className={styles.subTestIcon} />
            <span>{test}</span>
            <a href="/" target="_blank">
              <GithubIcon className={styles.subTestIcon} />
            </a>
          </div>
        </div>
      </div>
      <div className={styles.execute}>
        <p>Name your endpoint to execute a security test.</p>
        <div className={styles.command}>
          <InputGroup
            groupClassName={styles.create}
            placeholder="Enter a name for the endpoint"
            type="text"
            after={<RefreshIcon className={styles.refreshIcon} />}
          />
          <Button>Create</Button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;

import { Helmet } from "react-helmet";
import styles from "./app.module.css";
import {
  Button,
  CheckmarkIcon,
  CopyIcon,
  GithubIcon,
  IconButton,
  LinuxIcon,
  PulseSmallIcon,
} from "@theprelude/ds";

export default function Welcome() {
  return (
    <div className={styles.welcome}>
      <Helmet>
        <title>Prelude | Welcome</title>
        <style>{"body {  background-color: #1a2121; }"}</style>
      </Helmet>
      <section className={styles.guide}>
        <div className={styles.headline}>
          <PulseSmallIcon className={styles.pulse} />
          <h4>Verified Security Test</h4>
        </div>
        <div className={styles.test}>
          <h2>Can we exploit the Office macro CVEs?</h2>
          <p>
            LockBit 2.0 is an affiliate-based Ransomware-as-a-Service (RaaS)
            that was first observed in June 2021. This chain simulates
            post-exploitation activity of LockBit, including deleting Volume
            Shadow Copies, performing a UAC bypass, creating a named pipe, and
            writing a ransom note to the user's desktop. Endpoint detection
            should identify LockBit 2.0 ransomware activity and respond before
            it can cause damage. This chain must be run as Administrator.
          </p>
          <div className={styles.subTests}>
            <div className={styles.subTest}>
              <CheckmarkIcon className={styles.subTestIcon} />
              <span>Sub Test name</span>
              <a>
                <GithubIcon className={styles.subTestIcon} />
              </a>
            </div>
          </div>
        </div>
        <div className={styles.execute}>
          <p>
            Execute this test by running the following command in your terminal.
          </p>
          <div className={styles.platforms}>
            <Button icon={<LinuxIcon />} intent="secondary">
              Platform Name
            </Button>
          </div>
          <div className={styles.command}>
            <input
              className={styles.curl}
              type="url"
              value={"This is the cURL"}
              readOnly
            ></input>
            <IconButton
              className={styles.copyIcon}
              intent="secondary"
              icon={<CopyIcon />}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

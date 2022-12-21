import { Helmet } from "react-helmet";
import styles from "./app.module.css";
import {
  Button,
  CheckmarkIcon,
  CopyIcon,
  DarwinIcon,
  GithubIcon,
  IconButton,
  LinuxIcon,
  PulseSmallIcon,
} from "@theprelude/ds";
import { useTests } from "../hooks/use-tests";
import { changePallete } from "@theprelude/core";

export default function Welcome() {
  changePallete("welcome");
  const tests = useTests();
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
          <h2>{testName}</h2>
          <p>{testDescription}</p>
          <div className={styles.subTests}>
            {tests.data?.map((t) => (
              <div className={styles.subTest} key={t.question}>
                <CheckmarkIcon className={styles.subTestIcon} />
                <span>{t.question}</span>
                <a href="/" target="_blank">
                  <GithubIcon className={styles.subTestIcon} />
                </a>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.execute}>
          <p>
            Execute this test by running the following command in your terminal.
          </p>
          <div className={styles.platforms}>
            <Button icon={<LinuxIcon />} intent="secondary">
              Linux
            </Button>
            <Button icon={<DarwinIcon />} intent="secondary">
              Darwin
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

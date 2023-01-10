import { Probe } from "@theprelude/core";
import { CheckmarkIcon, GithubIcon, ProbeStatusIcon } from "@theprelude/ds";
import styles from "./activity.module.css";

// const statusMessage = {
//   "1": "The test encountered an unexpected error",
//   "2": "The test was malformed",
//   "3-8": "The test encountered an unhandled internal error",
//   "9": "The operating system blocked the test from executing",
//   "10-14": "The test encountered an unhandled internal error",
//   "15": "The test stopped itself due to a safety concern",
//   "17-18": "A defensive mechanism on the endpoint stopped the test",
//   "24-25": "The test was stopped due to high resource usage",
//   "100": "The test answered yes",
//   "101": "The test answered no",
//   "102": "The test was stopped by the probe because it ran too long",
//   "103": "There was a cleanup failure",
//   "104": "The test is not relevant to the endpoint",
//   "256": "There was an unexpected execution error",
// };

// const checkStatus = (probeTime: string) => {
//   const date = new Date().getTime();
//   const probeDate = new Date(probeTime).getTime();
//   const difference = (date - probeDate) / 3600000;
//   if (difference > 12.25) {
//     return "inactive";
//   } else {
//     return "active";
//   }
// };

const Activity: React.FC<{
  probe?: Probe;
  activity: Record<string, any>;
}> = ({ probe }) => {
  return (
    <div className={styles.activity}>
      <div className={styles.report}>
        <div className={styles.probe}>
          <pre>{probe?.endpoint_id}</pre>
          <ProbeStatusIcon />
        </div>
        <h2 className={styles.title}>Can we exploit the Office macro CVEs?</h2>

        <div className={styles.results}>
          <div className={styles.result}>
            <CheckmarkIcon className={styles.checkmark} />
            <div className={styles.resultInfo}>
              <div className={styles.test}>
                <span className={styles.checkmark}>Test Name</span>
                <a>
                  <GithubIcon />
                </a>
              </div>
              <p>Test info</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.dashboard}>
        <div className={styles.entry}></div>
      </div>
    </div>
  );
};

export default Activity;

import { ComputeResult } from "@theprelude/sdk";
import classNames from "classnames";
import { useState } from "react";
import AlertIcon from "../icons/alert-icon";
import CheckmarkIcon from "../icons/checkmark-icon";
import ChevronIcon from "../icons/chevron-icon";
import LaunchIcon from "../icons/launch-icon";
import TimeIcon from "../icons/time-icon";
import styles from "./variant-results.module.css";

interface Props {
  results: ComputeResult[];
}

const VariantResults: React.FC<Props> = ({ results }) => {
  const sucesses = 0;
  const failures = 0;
  if (results.map((r) => r.steps.map((s) => s.status).includes(1))) {
    failures + 1;
  } else {
    sucesses + 1;
  }
  return (
    <ul>
      {results.map((r) => (
        <VariantResult result={r} key={r.name} />
      ))}
      <li className={styles.pass}> {sucesses} Compeleted</li>
      <li className={styles.alert}>{failures} Failed</li>
    </ul>
  );
};

export default VariantResults;

const VariantResult: React.FC<{ result: ComputeResult }> = ({ result }) => {
  const [expanded, setExpanded] = useState(false);
  const status = result.steps.map((s) => s.status);
  return (
    <li className={styles.variantContainer}>
      <div className={styles.variant} onClick={() => setExpanded(!expanded)}>
        {status.every((e) => e === 0) ? (
          <CheckmarkIcon className={styles.checkmarkIcon} />
        ) : (
          <AlertIcon className={styles.alertIcon} />
        )}
        <span className={styles.name}>{result.name}</span>
        <ChevronIcon
          className={classNames(styles.chevronIcon, {
            [styles.activeChevron]: expanded,
          })}
        />
      </div>
      <ul
        className={classNames(styles.steps, {
          [styles.expanded]: expanded,
        })}
      >
        {result.steps.map((s) => (
          <li className={styles.step} key={s.step}>
            <div className={styles.info}>
              <div className={styles.infoBlock}>
                <ChevronIcon className={styles.stepChevron} />
                <span>{s.step}</span>
              </div>
              {s.status === 0 ? (
                <div className={styles.infoBlock}>
                  <CheckmarkIcon className={styles.checkmarkIcon} />
                  <span className={styles.pass}>Pass</span>
                </div>
              ) : (
                <div className={styles.infoBlock}>
                  <AlertIcon className={styles.alertIcon} />
                  <span className={styles.alert}>Error</span>
                </div>
              )}
              <div className={styles.infoBlock}>
                <TimeIcon className={styles.timeIcon} />
                <span>{s.duration}s</span>
              </div>
            </div>
            <VariantOutput step={s} />
            {s.step.toLowerCase() === "publish" ? (
              <button className={styles.publish}>
                <LaunchIcon className={styles.launchIcon} />
                <span>Publish</span>
              </button>
            ) : (
              ""
            )}
          </li>
        ))}
      </ul>
    </li>
  );
};

const VariantOutput: React.FC<{
  step: {
    output: string | unknown[];
    status: number;
    step: string;
    duration: string;
  };
}> = ({ step }) => {
  const output = Array.isArray(step.output) ? step.output[0] : step.output;
  const [readMore, setReadMore] = useState(false);
  return (
    <>
      {readMore ? (
        <ul className={styles.outputArray}>
          {Array.isArray(step.output)
            ? step.output.map((o) => (
                <li className={step.status !== 0 ? styles.alert : ""}>{o}</li>
              ))
            : ""}
          <span
            onClick={() => setReadMore(!readMore)}
            className={classNames(styles.details, styles.lessDetail, {
              [styles.alert]: step.status !== 0,
            })}
          >
            Less Details
          </span>
        </ul>
      ) : (
        <div className={styles.output}>
          {Array.isArray(step.output) && step.output.length !== 0 ? (
            <>
              <span
                className={classNames(styles.truncate, {
                  [styles.alert]: step.status !== 0,
                })}
              >
                {output}
              </span>
              <span
                onClick={() => setReadMore(!readMore)}
                className={classNames(styles.details, {
                  [styles.alert]: step.status !== 0,
                })}
              >
                See Details
              </span>
            </>
          ) : (
            <>
              <span className={step.status !== 0 ? styles.alert : ""}>
                {output}
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
};

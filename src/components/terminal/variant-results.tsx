import { ComputeResult } from "@theprelude/sdk";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import shallow from "zustand/shallow";
import useAuthStore from "../../hooks/auth-store";
import { createURL } from "../../lib/api";
import { parseBuildVariant } from "../../lib/utils/parse-variant";
import { select } from "../../lib/utils/select";
import AlertIcon from "../icons/alert-icon";
import CheckmarkIcon from "../icons/checkmark-icon";
import ChevronIcon from "../icons/chevron-icon";
import CopyIcon from "../icons/copy-icon";
import DownloadIcon from "../icons/download-icon";
import LoaderIcon from "../icons/loader-icon";
import TimeIcon from "../icons/time-icon";
import VariantIcon from "../icons/variant-icon";
import { notifyError, notifySuccess } from "../notifications/notifications";
import styles from "./variant-results.module.css";

interface Props {
  question: string;
  results: ComputeResult[];
}

const TIMEOUT_LINK = 1000 * 60 * 10;

const VariantResults: React.FC<Props> = ({ results, question }) => {
  const sucesses = results.filter((result) =>
    result.steps.every((step) => step.status === 0)
  );
  const failures = results.filter(
    (result) => !result.steps.every((step) => step.status === 0)
  );

  const longestTime = results
    .flatMap((result) => result.steps.map((step) => step.duration))
    .map((duration) => parseFloat(duration))
    .sort((a, b) => b - a)[0];

  return (
    <div className={styles.results}>
      <span className={styles.title}>Tested and compiled "{question}"</span>
      <ul>
        {results.map((r) => (
          <VariantResult result={r} key={r.name} />
        ))}
      </ul>
      <span className={classNames(styles.pass, styles.passBorder)}>
        {sucesses.length} variant(s) complied
      </span>
      <span className={styles.alert}>{failures.length} variant(s) failed</span>
      <span className={styles.time}>
        Total build time executed in {longestTime.toFixed(3)}s
      </span>
    </div>
  );
};

export default VariantResults;

const isEmpty = (val: string | Array<unknown>): boolean =>
  (Array.isArray(val) && val.length === 0) || val === "";

const VariantResult: React.FC<{ result: ComputeResult }> = ({ result }) => {
  const [expanded, setExpanded] = useState(false);

  const status = result.steps.map((s) => s.status);
  const isPass = status.every((e) => e === 0);
  const hasSuccessPublish = result.steps.some(
    (s) => s.step.toLowerCase() === "publish" && s.status === 0
  );
  return (
    <li className={styles.variantContainer}>
      <div className={styles.variant} onClick={() => setExpanded(!expanded)}>
        {isPass ? (
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
      {expanded && (
        <ul className={classNames(styles.steps)}>
          {result.steps.map((s) => (
            <li
              className={classNames(styles.step, {
                [styles.stepCentered]:
                  s.step.toLowerCase() === "publish" && !s.output,
              })}
              key={s.step}
            >
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

              {!isEmpty(s.output) && <VariantOutput step={s} />}
            </li>
          ))}
          {hasSuccessPublish && (
            <li className={classNames(styles.step, styles.stepCentered)}>
              <div className={styles.info}>
                <div className={styles.infoDeployBlock}>
                  <ChevronIcon className={styles.stepChevron} />
                  <span>DEPLOY on</span>
                  <VariantIcon
                    className={styles.deployIcon}
                    platform={parseBuildVariant(result.name)?.platform}
                  />
                  <span>
                    {parseBuildVariant(result.name)?.platform}-
                    {parseBuildVariant(result.name)?.arch}
                  </span>

                  <div className={styles.divider} />
                  <DownloadLink variant={result.name} />
                </div>
              </div>
            </li>
          )}
        </ul>
      )}
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
  const isArrayOutput = Array.isArray(step.output);
  const output = Array.isArray(step.output)
    ? (step.output[0] as string) ?? ""
    : step.output;

  const [readMore, setReadMore] = useState(false);
  return (
    <div
      className={classNames(styles.output, {
        [styles.more]: readMore,
      })}
    >
      <span
        className={classNames({
          [styles.truncate]: isArrayOutput && !readMore,
          [styles.alert]: step.status !== 0,
        })}
      >
        {output}
      </span>

      {readMore && Array.isArray(step.output) && (
        <>
          {step.output.slice(1).map((o) => (
            <span
              key={Date.now()}
              className={step.status !== 0 ? styles.alert : ""}
            >
              {o}
            </span>
          ))}
        </>
      )}
      {Array.isArray(step.output) && step.output.length !== 0 && (
        <span
          onClick={() => setReadMore(!readMore)}
          className={classNames(styles.details, {
            [styles.alert]: step.status !== 0,
          })}
        >
          {!readMore ? "See Details" : "  Less Details"}
        </span>
      )}
    </div>
  );
};

interface DownloadLinkProps {
  variant: string;
}

const DownloadLink: React.FC<DownloadLinkProps> = ({ variant }) => {
  const { host, credentials, showTooltip } = useAuthStore(
    select("host", "credentials", "showTooltip"),
    shallow
  );
  const [linkAvailable, setLinkAvailable] = useState(false);
  const [url, setURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!linkAvailable) {
      return;
    }
    const interval = setInterval(() => {
      setRemaining((state) => (state <= 0 ? 0 : state - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [linkAvailable]);

  const handleDownloadLink = async (variant: string) => {
    setLoading(true);
    try {
      const { url } = await createURL(variant, { host, credentials });
      setURL(url);
      setLinkAvailable(true);
      setRemaining(TIMEOUT_LINK);
      setTimeout(() => {
        setLinkAvailable(false);
      }, TIMEOUT_LINK);
    } catch {
    } finally {
      setLoading(false);
      showTooltip();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      notifySuccess("Link copied to clipboard");
    } catch (error) {
      notifyError("Failed to copy to clipboard", error);
    }
  };

  const minutes = Math.floor(remaining / 1000 / 60);
  const seconds = remaining / 1000 - minutes * 60;
  return (
    <div onClick={(e) => e.stopPropagation()}>
      {linkAvailable && url ? (
        <div className={classNames(styles.download, styles.copy)}>
          {/* <span>
            Use curl or wget to deploy the Detect node on your instance.
          </span> */}
          <input type="url" value={url} readOnly className={styles.url}></input>
          <button className={styles.iconContainer} onClick={() => handleCopy()}>
            <CopyIcon className={styles.copyIcon} />
          </button>

          <div style={{ width: 20, height: 20, marginTop: -6 }}>
            <CircularProgressbar
              value={(remaining / TIMEOUT_LINK) * 100}
              strokeWidth={50}
              styles={buildStyles({
                strokeLinecap: "butt",
                backgroundColor: "#D9D9D9",
                pathColor: "#3D4246",
              })}
            />
          </div>
          <span>
            Expires in {minutes.toString().padStart(2, "0")}:
            {seconds.toString().padStart(2, "0")}
          </span>
        </div>
      ) : (
        <button
          className={styles.downloadButton}
          onClick={() => handleDownloadLink(variant)}
        >
          {loading ? (
            <>
              <LoaderIcon
                className={classNames(styles.downloadIcon, styles.loaderIcon)}
              />
              <span>Generating link...</span>
            </>
          ) : (
            <>
              <DownloadIcon className={styles.downloadIcon} />
              <span>Generate Deploy Link</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

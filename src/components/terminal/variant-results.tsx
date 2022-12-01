import { useMutation } from "@tanstack/react-query";
import { ComputeResult } from "@theprelude/sdk";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import shallow from "zustand/shallow";
import useAuthStore from "../../hooks/auth-store";
import { useTimer } from "../../hooks/use-timer";
import { createURL } from "../../lib/api";
import { parseBuildVariant } from "../../lib/utils/parse-variant";
import { select } from "../../lib/utils/select";
import Button from "../ds/button/button";
import IconButton from "../ds/button/icon-button";
import AlertIcon from "../ds/icons/alert-icon";
import CheckmarkIcon from "../ds/icons/checkmark-icon";
import ChevronIcon from "../ds/icons/chevron-icon";
import CopyIcon from "../ds/icons/copy-icon";
import DownloadIcon from "../ds/icons/download-icon";
import TimeIcon from "../ds/icons/time-icon";
import VariantIcon from "../ds/icons/variant-icon";
import { notifyError, notifySuccess } from "../notifications/notifications";
import styles from "./variant-results.module.css";

interface Props {
  question: string;
  results: ComputeResult[];
}

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

const TIMEOUT_LINK = 10 * 60 * 1000;
const VariantResult: React.FC<{ result: ComputeResult }> = ({ result }) => {
  const [expanded, setExpanded] = useState(false);
  const [deployURL, setDeployURL] = useState<string | null>(null);
  const { host, credentials, showTooltip } = useAuthStore(
    select("host", "credentials", "showTooltip"),
    shallow
  );
  const mutation = useMutation(
    () => createURL(result.name, { host, credentials }),
    {
      onSuccess: ({ url }) => {
        setDeployURL(url);
      },
      onSettled: () => {
        showTooltip();
      },
    }
  );

  const timer = useTimer({
    time: TIMEOUT_LINK,
    onComplete() {
      setDeployURL(null);
    },
  });

  useEffect(() => {
    if (deployURL) {
      timer.start();
    }
    () => {
      timer.cancel();
    };
  }, [deployURL]);

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
        {!expanded && hasSuccessPublish && (
          <>
            <div className={styles.divider} />
            <DownloadLink
              deployURL={deployURL}
              onClick={() => mutation.mutate()}
              loading={mutation.isLoading}
              timer={timer}
            />
          </>
        )}

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

              {s.output.length !== 0 && <VariantOutput step={s} />}
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
                  <DownloadLink
                    deployURL={deployURL}
                    onClick={() => mutation.mutate()}
                    loading={mutation.isLoading}
                    timer={timer}
                  />
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
  onClick: () => void;
  deployURL: string | null;
  loading: boolean;
  timer: { percent: number; minutes: number; seconds: number };
}

const DownloadLink: React.FC<DownloadLinkProps> = ({
  onClick,
  deployURL,
  loading,
  timer,
}) => {
  const handleCopy = async () => {
    try {
      if (!deployURL) {
        throw new Error("missing url");
      }
      await navigator.clipboard.writeText(deployURL);
      notifySuccess("Link copied to clipboard");
    } catch (error) {
      notifyError("Failed to copy to clipboard", error);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {deployURL ? (
        <div className={classNames(styles.download, styles.copy)}>
          <input
            type="url"
            value={deployURL}
            readOnly
            className={styles.url}
          ></input>
          <IconButton
            className={styles.copyIconButton}
            onClick={() => handleCopy()}
            intent="primary"
            icon={<CopyIcon />}
          />
          <div style={{ width: 20, height: 20, marginTop: -6 }}>
            <CircularProgressbar
              counterClockwise
              value={timer.percent}
              strokeWidth={50}
              styles={buildStyles({
                strokeLinecap: "butt",
                backgroundColor: "#D9D9D9",
                pathColor: "#3D4246",
              })}
            />
          </div>
          <span>
            Expires in {timer.minutes.toString().padStart(2, "0")}:
            {timer.seconds.toString().padStart(2, "0")}
          </span>
        </div>
      ) : (
        <Button
          onClick={onClick}
          intent={"secondary"}
          size={"small"}
          icon={<DownloadIcon />}
          loading={loading}
        >
          {loading ? "Generating link..." : "Generate Deploy Link"}
        </Button>
      )}
    </div>
  );
};

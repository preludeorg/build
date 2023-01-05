import { useMutation } from "@tanstack/react-query";
import {
  createURL,
  parseBuildVerifiedSecurityTest,
  select,
  useAuthStore,
} from "@theprelude/core";
import {
  AlertIcon,
  Button,
  CheckmarkIcon,
  ChevronIcon,
  CloseIcon,
  CopyIcon,
  DownloadIcon,
  IconButton,
  notifyError,
  notifySuccess,
  TimeIcon,
  VariantIcon,
} from "@theprelude/ds";
import { ComputeResult } from "@theprelude/sdk";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import shallow from "zustand/shallow";
import { useTimer } from "../../hooks/use-timer";
import styles from "./results.module.css";

const Results: React.FC<{ results: ComputeResult[] }> = ({ results }) => {
  const [hide, setHide] = React.useState(false);
  if (hide) return null;
  return (
    <div className={styles.results}>
      <span className={styles.exit}>
        <IconButton icon={<CloseIcon />} onClick={() => setHide(true)} />
      </span>
      <ul className={styles.variantContainer}>
        {results.map((r) => (
          <VariantResult result={r} key={r.name} />
        ))}
      </ul>
    </div>
  );
};
export default Results;

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
                    platform={
                      parseBuildVerifiedSecurityTest(result.name)?.platform
                    }
                  />
                  <span>
                    {parseBuildVerifiedSecurityTest(result.name)?.platform}-
                    {parseBuildVerifiedSecurityTest(result.name)?.arch}
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

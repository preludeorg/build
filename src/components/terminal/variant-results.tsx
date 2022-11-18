import { ComputeResult } from "@theprelude/sdk";
import classNames from "classnames";
import { useState } from "react";
import useAuthStore from "../../hooks/auth-store";
import AlertIcon from "../icons/alert-icon";
import CheckmarkIcon from "../icons/checkmark-icon";
import ChevronIcon from "../icons/chevron-icon";
import TimeIcon from "../icons/time-icon";
import styles from "./variant-results.module.css";
import shallow from "zustand/shallow";
import { select } from "../../lib/utils/select";
import { createURL } from "../../lib/api";
import CopyIcon from "../icons/copy-icon";
import LoaderIcon from "../icons/loader-icon";
import DownloadIcon from "../icons/download-icon";

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
      <span className={styles.pass}>{sucesses.length} variant(s) complied</span>
      <span className={styles.alert}>{failures.length} variant(s) failed</span>
      <span className={styles.time}>
        Total build time executed in {longestTime.toFixed(3)}s
      </span>
    </div>
  );
};

export default VariantResults;

const isEmpty = (val: string | Array<any>): boolean =>
  (Array.isArray(val) && val.length === 0) || val === "";

const VariantResult: React.FC<{ result: ComputeResult }> = ({ result }) => {
  const [expanded, setExpanded] = useState(false);
  const [linkAvailable, setLinkAvailable] = useState(false);
  const [url, setURL] = useState("");
  const [loading, setLoading] = useState(false);
  const status = result.steps.map((s) => s.status);
  const isPass = status.every((e) => e === 0);
  return (
    <li className={styles.variantContainer}>
      <div className={styles.variant} onClick={() => setExpanded(!expanded)}>
        {isPass ? (
          <CheckmarkIcon className={styles.checkmarkIcon} />
        ) : (
          <AlertIcon className={styles.alertIcon} />
        )}
        <span className={styles.name}>{result.name}</span>
        {!expanded && isPass ? (
          <DownloadLink
            variant={result.name}
            linkAvailable={linkAvailable}
            setLinkAvailable={setLinkAvailable}
            url={url}
            setURL={setURL}
            loading={loading}
            setLoading={setLoading}
          />
        ) : (
          ""
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

              {!isEmpty(s.output) && <VariantOutput step={s} />}

              {s.step.toLowerCase() === "publish" && s.status !== 1 && (
                <DownloadLink
                  variant={result.name}
                  linkAvailable={linkAvailable}
                  setLinkAvailable={setLinkAvailable}
                  url={url}
                  setURL={setURL}
                  loading={loading}
                  setLoading={setLoading}
                />
              )}
            </li>
          ))}
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
  linkAvailable: boolean;
  setLinkAvailable: (b: boolean) => void;
  url: string;
  setURL: (u: string) => void;
  loading: boolean;
  setLoading: (b: boolean) => void;
}

const DownloadLink: React.FC<DownloadLinkProps> = ({
  variant,
  linkAvailable,
  setLinkAvailable,
  url,
  setURL,
  loading,
  setLoading,
}) => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const handleDownloadLink = async (variant: string) => {
    setLoading(true);
    try {
      const { url } = await createURL(variant, serviceConfig);
      setURL(url);
      setLinkAvailable(true);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
  };
  return (
    <div onClick={(e) => e.stopPropagation()}>
      {linkAvailable && url ? (
        <button className={styles.download} onClick={() => handleCopy()}>
          <input type="url" value={url} readOnly className={styles.url}></input>
          <CopyIcon className={styles.copyIcon} />
        </button>
      ) : (
        <button
          className={styles.download}
          onClick={(e) => handleDownloadLink(variant)}
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
              <span>Download link</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

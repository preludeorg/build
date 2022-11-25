import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Test } from "@theprelude/sdk";
import classNames from "classnames";
import { useEffect, useMemo, useRef, useState } from "react";
import shallow from "zustand/shallow";
import useAuthStore from "../../../hooks/auth-store";
import { useTests } from "../../../hooks/use-tests";
import { createURL, deleteVerified, verifiedTests } from "../../../lib/api";
import { parseBuildVariant } from "../../../lib/utils/parse-variant";
import { select } from "../../../lib/utils/select";
import ChevronIcon from "../../icons/chevron-icon";
import CloseIcon from "../../icons/close-icon";
import CopyIcon from "../../icons/copy-icon";
import DownloadIcon from "../../icons/download-icon";
import { Loading } from "../../icons/loading";
import Trashcan from "../../icons/trashcan-icon";
import VariantIcon from "../../icons/variant-icon";
import { notifyError, notifySuccess } from "../../notifications/notifications";
import Overlay from "../overlay";
import styles from "./verified-test.module.css";

const filterVST = (test: Test, vst: string[]) => {
  return vst.filter((v) => parseBuildVariant(v)?.id === test.id);
};

const VerifiedTests: React.FC = () => {
  const tests = useTests();
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const verified = useQuery(["verified-tests", serviceConfig], () =>
    verifiedTests(serviceConfig)
  );

  const isLoading = tests.isLoading || verified.isLoading;
  const testIds = useMemo(
    () => new Set(verified.data?.map((t) => parseBuildVariant(t)?.id ?? "")),
    verified.data
  );

  return (
    <Overlay
      loading={isLoading}
      position="right"
      title="Verified Security Tests"
      description="Verified Security Tests (VSTs) are production-ready tests. Your
    authored VSTs appear below."
    >
      {verified.data &&
        tests.data
          ?.filter((test) => testIds.has(test.id))
          .map((test) => (
            <TestItem
              key={test.id}
              test={test}
              variants={filterVST(test, verified.data)}
            />
          ))}
    </Overlay>
  );
};

const TestItem: React.FC<{
  test: Test;
  variants: string[];
}> = ({ test, variants }) => {
  const [expanded, setExpanded] = useState(true);
  return (
    <div
      className={classNames(styles.test, {
        [styles.active]: expanded,
      })}
    >
      <header onClick={() => setExpanded(!expanded)}>
        <span>{test.question}</span>
        <ChevronIcon
          className={classNames(styles.chevronIcon, {
            [styles.activeChevron]: expanded,
          })}
        />
      </header>
      {expanded && (
        <section className={styles.variants}>
          {variants.map((variant) => {
            return <Variant key={variant} variant={variant} />;
          })}
        </section>
      )}
    </div>
  );
};

const Variant: React.FC<{
  variant: string;
}> = ({ variant }) => {
  const [linkAvailable, setLinkAvailable] = useState(false);
  const [url, setURL] = useState("");
  const platform = parseBuildVariant(variant)?.platform;
  return (
    <div>
      <VariantIcon className={styles.variantIcon} platform={platform} />
      <span>{variant}</span>
      <CopyButton
        variant={variant}
        linkAvailable={linkAvailable}
        setLinkAvailable={setLinkAvailable}
        url={url}
        setURL={setURL}
      />
      <DeleteButton variant={variant} />
    </div>
  );
};

const CopyButton: React.FC<{
  variant: string;
  linkAvailable: boolean;
  setLinkAvailable: (b: boolean) => void;
  url: string;
  setURL: (u: string) => void;
}> = ({ variant, linkAvailable, setLinkAvailable, url, setURL }) => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const [loading, setLoading] = useState(false);

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
      notifySuccess("Link copied to clipboard. Link expires in 10 minutes.");
    } catch (error) {
      notifyError("Failed to copy to clipboard", error);
    }
  };
  return (
    <>
      {linkAvailable && url ? (
        <button onClick={handleCopy} className={styles.copy}>
          <CopyIcon />
        </button>
      ) : (
        <>
          {loading ? (
            <button className={styles.copy}>
              <Loading />
            </button>
          ) : (
            <button
              onClick={() => handleDownloadLink(variant)}
              className={styles.copy}
            >
              <DownloadIcon />
            </button>
          )}
        </>
      )}
    </>
  );
};

const DeleteButton: React.FC<{ variant: string }> = ({ variant }) => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [deletePrompt, setDeletePrompt] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setDeletePrompt(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [ref.current]);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteVerified(variant, serviceConfig);
      await queryClient.invalidateQueries(["verified-tests"]);
      notifySuccess("Verified security test deleted.");
    } catch (e) {
      notifyError("Failed to delete verified security test", e);
    } finally {
      setLoading(false);
      setDeletePrompt(false);
    }
  };
  return (
    <div className={styles.deleteContainer} ref={ref}>
      <button
        onClick={() => setDeletePrompt(!deletePrompt)}
        className={styles.delete}
      >
        {loading ? <Loading /> : <Trashcan className={styles.variantIcon} />}
      </button>
      {deletePrompt ? (
        <div className={styles.deletePrompt}>
          <div className={styles.message}>
            <span>Do you want to delete this variant?</span>
            <button onClick={() => setDeletePrompt(false)}>
              <CloseIcon />
            </button>
          </div>
          <div className={styles.confirmation}>
            <button onClick={handleDelete} className={styles.approve}>
              Yes
            </button>
            <button onClick={() => setDeletePrompt(false)}>No</button>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default VerifiedTests;

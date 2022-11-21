import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import shallow from "zustand/shallow";
import useAuthStore from "../../hooks/auth-store";
import useNavigationStore from "../../hooks/navigation-store";
import useTestsStore from "../../hooks/tests-store";
import { createURL, deleteVerified } from "../../lib/api";
import { parseBuildVariant } from "../../lib/utils/parse-variant";
import { select } from "../../lib/utils/select";
import ChevronIcon from "../icons/chevron-icon";
import CloseIcon from "../icons/close-icon";
import CopyIcon from "../icons/copy-icon";
import HelpIcon from "../icons/help-icon";
import LoaderIcon from "../icons/loader-icon";
import Trashcan from "../icons/trashcan-icon";
import VariantIcon from "../icons/variant-icon";
import { notifyError, notifySuccess } from "../notifications/notifications";
import styles from "./verified-test.module.css";

const VerifiedTests: React.FC = () => {
  const hideOverlay = useNavigationStore((state) => state.hideOverlay);
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const { fetch, loading } = useTestsStore(select("fetch", "loading"), shallow);
  const tests = useTestsStore((state) => {
    return state.tests.map((test) => {
      return {
        id: test.id,
        question: test.question,
        variants: state.builtVariants.filter((v) => v.startsWith(test.id)),
      };
    });
  }, shallow);

  useEffect(() => {
    void fetch(serviceConfig);
  }, []);

  return (
    <div className={styles.overlay}>
      <div
        className={styles.backdrop}
        onClick={() => {
          hideOverlay();
        }}
      />
      <div className={classNames(styles.panel, styles.right)}>
        <button className={styles.close} onClick={() => hideOverlay()}>
          <CloseIcon />
        </button>
        <div className={styles.title}>
          <span className={styles.legend}>
            Verified Security Tests{" "}
            {loading ? (
              <LoaderIcon className={styles.loaderIcon} />
            ) : (
              <a
                href="https://docs.prelude.org/v2/docs/deploying-security-tests"
                target="_blank"
              >
                <HelpIcon className={styles.helpIcon} />
              </a>
            )}
          </span>
        </div>
        <span className={styles.description}>
          Verified Security Tests (VSTs) are production-ready tests. Your
          authored VSTs appear below.
        </span>
        {tests.map((test) => (
          <Test
            key={test.id}
            test={test}
          />
        ))}
      </div>
    </div>
  );
};

const Test: React.FC<{
  test: { id: string; question: string; variants: string[] };
}> = ({ test }) => {
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
          {test.variants.map((variant) => {
            const platform = parseBuildVariant(variant)?.platform;
            return (
              <div key={variant}>
                <VariantIcon
                  className={styles.variantIcon}
                  platform={platform}
                />
                <span>{variant}</span>
                <CopyButton variant={variant} />
                <DeleteButton variant={variant} />
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
};

const CopyButton: React.FC<{ variant: string }> = ({ variant }) => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const [loading, setLoading] = useState(false);
  const handleCopy = async () => {
    try {
      setLoading(true);
      const { url } = await createURL(variant, serviceConfig);
      await navigator.clipboard.writeText(url);
      notifySuccess("Link copied to clipboard. Link expires in 10 minutes.");
    } catch (error) {
      notifyError("Failed to copy to clipboard", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={handleCopy} className={styles.copy}>
      {loading ? <LoaderIcon className={styles.loading} /> : <CopyIcon />}
    </button>
  );
};

const DeleteButton: React.FC<{ variant: string }> = ({ variant }) => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const { fetch } = useTestsStore(select("fetch"), shallow);
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
      await fetch(serviceConfig);
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
        {loading ? (
          <LoaderIcon className={styles.loading} />
        ) : (
          <Trashcan className={styles.variantIcon} />
        )}
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

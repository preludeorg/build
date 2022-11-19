import classNames from "classnames";
import { useEffect, useState } from "react";
import shallow from "zustand/shallow";
import useAuthStore from "../../hooks/auth-store";
import useNavigationStore from "../../hooks/navigation-store";
import useTestsStore from "../../hooks/tests-store";
import { createURL } from "../../lib/api";
import { parseBuildVariant } from "../../lib/utils/parse-variant";
import { select } from "../../lib/utils/select";
import ChevronIcon from "../icons/chevron-icon";
import CopyIcon from "../icons/copy-icon";
import LoaderIcon from "../icons/loader-icon";
import VariantIcon from "../icons/variant-icon";
import styles from "./verified-test.module.css";

const VerifiedTests: React.FC = () => {
  const [expanded, setExpanded] = useState("");
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

  const handleExpand = (id: string) => {
    setExpanded(id);
  };

  return (
    <div className={styles.overlay}>
      <div
        className={styles.backdrop}
        onClick={() => {
          hideOverlay();
        }}
      />
      <div className={classNames(styles.panel, styles.right)}>
        <span className={styles.legend}>
          Compiled {loading && <LoaderIcon className={styles.loaderIcon} />}
        </span>
        {tests.map((test) => (
          <Test
            onExpand={handleExpand}
            expanded={expanded === test.id}
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
  expanded: boolean;
  onExpand: (id: string) => void;
}> = ({ test, expanded, onExpand }) => {
  return (
    <div
      className={classNames(styles.test, {
        [styles.active]: expanded,
      })}
    >
      <header onClick={() => onExpand(!expanded ? test.id : "")}>
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
              <div>
                <VariantIcon
                  className={styles.variantIcon}
                  platform={platform}
                />
                <span>{variant}</span>
                <CopyButton variant={variant} />
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
    } catch {
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

export default VerifiedTests;

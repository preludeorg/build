import classNames from "classnames";
import { useEffect, useState } from "react";
import shallow from "zustand/shallow";
import useAuthStore from "../../hooks/auth-store";
import useNavigationStore from "../../hooks/navigation-store";
import useTestsStore from "../../hooks/tests-store";
import { getTest } from "../../lib/api";
import { parseBuildVariant } from "../../lib/utils/parse-variant";
import { select } from "../../lib/utils/select";
import ChevronIcon from "../icons/chevron-icon";
import CloseIcon from "../icons/close-icon";
import LoaderIcon from "../icons/loader-icon";
import VariantIcon from "../icons/variant-icon";
import styles from "./test-catalog.module.css";

const TestCatalog = () => {
  const hideOverlay = useNavigationStore((state) => state.hideOverlay);
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const { fetch, loading, tests } = useTestsStore(
    select("fetch", "loading", "tests"),
    shallow
  );

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
            Tests
            {loading ? <LoaderIcon className={styles.loaderIcon} /> : ""}
          </span>
        </div>
        <span className={styles.description}>
          Your authored Tests and their applicable Variants appear below.
        </span>
        {tests?.map((test) => (
          <Test key={test.id} test={test} />
        ))}
      </div>
    </div>
  );
};

const Test: React.FC<{
  test: { account_id: string; id: string; question: string };
}> = ({ test }) => {
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  return (
    <div
      className={classNames(styles.test, {
        [styles.active]: expanded,
      })}
    >
      <header onClick={() => setExpanded(!expanded)}>
        <span>{test.question}</span>
        {loading ? (
          <LoaderIcon className={styles.loaderIcon} />
        ) : (
          <ChevronIcon
            className={classNames(styles.chevronIcon, {
              [styles.activeChevron]: expanded,
            })}
          />
        )}
      </header>
      {expanded && <VariantList id={test.id} setLoading={setLoading} />}
    </div>
  );
};

const VariantList: React.FC<{
  id: string;
  setLoading: (b: boolean) => void;
}> = ({ id, setLoading }) => {
  const [variants, setVariants] = useState<string[]>([]);
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const fetchVariants = async () => {
    try {
      setLoading(true);
      const variants = await getTest(
        id,
        serviceConfig,
        new AbortController().signal
      );
      setVariants(variants);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void fetchVariants();
  }, []);

  return (
    <section className={styles.variants}>
      {variants.map((variant) => {
        return <Variant key={variant} variant={variant} />;
      })}
    </section>
  );
};

const Variant: React.FC<{
  variant: string;
}> = ({ variant }) => {
  const platform = parseBuildVariant(variant)?.platform;

  return (
    <div>
      <VariantIcon className={styles.variantIcon} platform={platform} />
      <span>{variant}</span>
    </div>
  );
};

export default TestCatalog;

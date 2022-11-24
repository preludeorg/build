import classNames from "classnames";
import { useEffect, useState } from "react";
import shallow from "zustand/shallow";
import useAuthStore from "../../../hooks/auth-store";
import useTestsStore from "../../../hooks/tests-store";
import { getTest } from "../../../lib/api";
import { parseBuildVariant } from "../../../lib/utils/parse-variant";
import { select } from "../../../lib/utils/select";
import ChevronIcon from "../../icons/chevron-icon";
import LoaderIcon from "../../icons/loader-icon";
import VariantIcon from "../../icons/variant-icon";
import Overlay from "../overlay";
import styles from "./test-catalog.module.css";

const TestCatalog: React.FC = () => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const { fetch, loading, tests } = useTestsStore(
    select("fetch", "loading", "tests"),
    shallow
  );

  useEffect(() => {
    void fetch(serviceConfig);
  }, []);

  return (
    <Overlay
      position="right"
      title="Tests"
      description="Your authored Tests and their applicable Variants appear below."
      loading={loading}
    >
      {tests?.map((test) => (
        <Test key={test.id} test={test} />
      ))}
    </Overlay>
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

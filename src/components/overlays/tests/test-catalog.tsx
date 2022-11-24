import { useQuery } from "@tanstack/react-query";
import { Test } from "@theprelude/sdk";
import classNames from "classnames";
import { useState } from "react";
import shallow from "zustand/shallow";
import useAuthStore from "../../../hooks/auth-store";
import { getTest, getTestList } from "../../../lib/api";
import { parseBuildVariant } from "../../../lib/utils/parse-variant";
import { select } from "../../../lib/utils/select";
import ChevronIcon from "../../icons/chevron-icon";
import LoaderIcon from "../../icons/loader-icon";
import VariantIcon from "../../icons/variant-icon";
import Overlay from "../overlay";
import styles from "./test-catalog.module.css";

const TestCatalog: React.FC = () => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const { data, isLoading } = useQuery(
    ["tests", serviceConfig],
    () => getTestList(serviceConfig),
    { refetchOnWindowFocus: false }
  );

  return (
    <Overlay
      position="right"
      title="Tests"
      description="Your authored Tests and their applicable Variants appear below."
      loading={isLoading}
    >
      {data?.map((test) => (
        <TestItem key={test.id} test={test} />
      ))}
    </Overlay>
  );
};

const TestItem: React.FC<{
  test: Test;
}> = ({ test }) => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const [expanded, setExpanded] = useState(false);

  const { data, isFetching } = useQuery(
    ["test", test.id, serviceConfig],
    () => getTest(test.id, serviceConfig),
    { refetchOnWindowFocus: false, enabled: expanded }
  );

  return (
    <div
      className={classNames(styles.test, {
        [styles.active]: expanded,
      })}
    >
      <header onClick={() => setExpanded(!expanded)}>
        <span>{test.question}</span>
        {isFetching ? (
          <LoaderIcon className={styles.loaderIcon} />
        ) : (
          <ChevronIcon
            className={classNames(styles.chevronIcon, {
              [styles.activeChevron]: expanded,
            })}
          />
        )}
      </header>
      {expanded && data && <VariantList variants={data} />}
    </div>
  );
};

const VariantList: React.FC<{
  variants: string[];
}> = ({ variants }) => {
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

import { useQuery } from "@tanstack/react-query";
import { Test } from "@theprelude/sdk";
import classNames from "classnames";
import { useState } from "react";
import shallow from "zustand/shallow";
import useAuthStore from "../../../hooks/auth-store";
import { useTests } from "../../../hooks/use-tests";
import { getTest } from "../../../lib/api";
import { parseVariant } from "../../../lib/utils/parse-variant";
import { select } from "../../../lib/utils/select";
import ChevronIcon from "../../icons/chevron-icon";
import { Loading } from "../../icons/loading";
import VariantIcon from "../../icons/variant-icon";
import Overlay from "../overlay";
import styles from "./security-tests.module.css";

const SecurityTests: React.FC = () => {
  const { data, isLoading } = useTests();

  return (
    <Overlay
      position="right"
      title="Security Tests"
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
    { enabled: expanded }
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
          <Loading />
        ) : (
          <ChevronIcon
            className={classNames(styles.chevronIcon, {
              [styles.activeChevron]: expanded,
            })}
          />
        )}
      </header>
      {expanded && data && (
        <section className={styles.variants}>
          {data.map((variant) => {
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
  const platform = parseVariant(variant)?.platform;

  return (
    <div>
      <VariantIcon className={styles.variantIcon} platform={platform} />
      <span>{variant}</span>
    </div>
  );
};

export default SecurityTests;

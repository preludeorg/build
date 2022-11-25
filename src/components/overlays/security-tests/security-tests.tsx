import { useQuery } from "@tanstack/react-query";
import { Test } from "@theprelude/sdk";
import shallow from "zustand/shallow";
import useAuthStore from "../../../hooks/auth-store";
import { useTests } from "../../../hooks/use-tests";
import { getTest } from "../../../lib/api";
import { parseVariant } from "../../../lib/utils/parse-variant";
import { select } from "../../../lib/utils/select";
import Accordion from "../../ds/accordion/accordion";
import {
  AccordionItem,
  AccordionList,
} from "../../ds/accordion/accordion-list";
import { useAccordion } from "../../ds/accordion/use-accordion";
import VariantIcon from "../../icons/variant-icon";
import Overlay from "../overlay";

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
  const accordion = useAccordion();

  const { data, isFetching } = useQuery(
    ["test", test.id, serviceConfig],
    () => getTest(test.id, serviceConfig),
    { enabled: accordion.expanded }
  );

  return (
    <Accordion
      title={test.question}
      loading={isFetching}
      expanded={accordion.expanded}
      onToggle={accordion.toogle}
    >
      {data && (
        <AccordionList>
          {data.map((variant) => {
            return (
              <AccordionItem
                key={variant}
                title={variant}
                icon={
                  <VariantIcon platform={parseVariant(variant)?.platform} />
                }
                actions={[]}
              />
            );
          })}
        </AccordionList>
      )}
    </Accordion>
  );
};

export default SecurityTests;

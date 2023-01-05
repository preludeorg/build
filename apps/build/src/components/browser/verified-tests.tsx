import { useMutation } from "@tanstack/react-query";
import {
  createURL,
  parseBuildVerifiedSecurityTest,
  select,
  useAuthStore,
} from "@theprelude/core";
import {
  Accordion,
  AccordionAction,
  AccordionItem,
  AccordionList,
  CopyIcon,
  DownloadIcon,
  EditorIcon,
  notifyError,
  notifySuccess,
  useAccordion,
  VariantIcon,
} from "@theprelude/ds";
import { Test } from "@theprelude/sdk";
import { useEffect, useMemo } from "react";
import shallow from "zustand/shallow";
import useIntroStore from "../../hooks/intro-store";
import { useOpenTest } from "../../hooks/use-open-test";
import { useTests } from "../../hooks/use-tests";
import { driver } from "../driver/driver";
import styles from "./browser.module.css";
import CreateTest from "./create-test";

const VerifiedTests: React.FC = () => {
  const { data, isFetching } = useTests();
  const isExpandedFirstTest = useIntroStore(
    (state) => state.isExpandedFirstTest
  );
  const testIds = useMemo(() => new Set(data?.map((t) => t.id)), [data]);
  return (
    <div className={styles.header}>
      <CreateTest testsFetching={isFetching} />
      {data &&
        data
          ?.filter((test) => testIds.has(test.id))
          .map((test, index) => (
            <TestItem
              key={test.id}
              defaultExpanded={index === 0 && isExpandedFirstTest}
              test={test}
            />
          ))}
    </div>
  );
};

const TestItem: React.FC<{
  test: Test;
  defaultExpanded: boolean;
}> = ({ test, defaultExpanded }) => {
  const accordion = useAccordion();

  useEffect(() => {
    accordion.setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  return (
    <Accordion
      expanded={accordion.expanded}
      onToggle={accordion.toogle}
      title={test.rule}
      edit={<OpenButton test={test} />}
      className={styles.accordion}
    >
      <AccordionList>
        {test.vst.map((vst) => (
          <AccordionItem
            key={vst}
            title={vst}
            icon={
              <VariantIcon
                platform={parseBuildVerifiedSecurityTest(vst)?.platform}
              />
            }
            actions={
              <>
                <CopyButton vstName={vst} />
              </>
            }
          />
        ))}
      </AccordionList>
    </Accordion>
  );
};

const CopyButton: React.FC<{
  vstName: string;
}> = ({ vstName }) => {
  const { markCompleted } = useIntroStore(select("markCompleted"), shallow);
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const { data, mutate, isLoading } = useMutation(
    (vstName: string) => createURL(vstName, serviceConfig),
    {
      onSuccess: () => {
        markCompleted("deployTest");
        notifySuccess(
          "Link generated. Click the copy icon to add it to your clipboard. Link expires in 10 minutes."
        );
      },
    }
  );

  const handleCopy = async () => {
    try {
      if (!data?.url) {
        throw new Error("no url");
      }
      await navigator.clipboard.writeText(data.url);
      notifySuccess("Link copied to clipboard.");
    } catch (error) {
      notifyError("Failed to copy to clipboard", error);
    }
  };

  if (!data?.url) {
    return (
      <AccordionAction
        className="deploy-button"
        loading={isLoading}
        onClick={() => {
          driver.reset();
          mutate(vstName);
        }}
        icon={<DownloadIcon />}
      />
    );
  }

  return (
    <AccordionAction
      className="deploy-button"
      onClick={handleCopy}
      icon={<CopyIcon />}
    />
  );
};

const OpenButton: React.FC<{ test: Test }> = ({ test }) => {
  const openTest = useOpenTest(test);

  return (
    <AccordionAction
      onClick={(e) => {
        e.stopPropagation();
        return openTest.mutate(test.filename);
      }}
      loading={openTest.isLoading}
      icon={<EditorIcon />}
    />
  );
};
export default VerifiedTests;

import { useMutation } from "@tanstack/react-query";
import {
  createURL,
  downloadTest,
  isPreludeTest,
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
import { useMemo } from "react";
import shallow from "zustand/shallow";
import { useTests } from "../../hooks/use-tests";
import { useTab } from "../../hooks/use-tab";
import useNavigationStore from "../../hooks/navigation-store";
import CreateTest from "./create-test";
import styles from "./browser.module.css";

const VerifiedTests: React.FC = () => {
  const { data, isLoading, isFetching } = useTests();
  const testIds = useMemo(() => new Set(data?.map((t) => t.id)), [data]);
  return (
    <div className={styles.header} title="Verified Security Tests">
      <CreateTest testsFetching={isFetching} />
      {data &&
        data
          ?.filter((test) => testIds.has(test.id))
          .map((test) => <TestItem key={test.id} test={test} />)}
    </div>
  );
};

const TestItem: React.FC<{
  test: Test;
}> = ({ test }) => {
  const accordion = useAccordion();
  const readonly = isPreludeTest(test);

  return (
    <Accordion
      expanded={accordion.expanded}
      onToggle={accordion.toogle}
      title={test.rule}
      edit={<OpenButton test={test} readonly={readonly} />}
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
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const { data, mutate, isLoading } = useMutation(
    (vstName: string) => createURL(vstName, serviceConfig),
    {
      onSuccess: () => {
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
        loading={isLoading}
        onClick={() => mutate(vstName)}
        icon={<DownloadIcon />}
      />
    );
  }

  return <AccordionAction onClick={handleCopy} icon={<CopyIcon />} />;
};

const OpenButton: React.FC<{ test: Test; readonly: boolean }> = ({
  test,
  readonly,
}) => {
  const { open } = useTab();
  const hideOverlay = useNavigationStore((state) => state.hideOverlay);
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const { mutate, isLoading } = useMutation(
    (testCodeFile: string) => downloadTest(testCodeFile, serviceConfig),
    {
      onSuccess: async (code) => {
        open(test, code);
        hideOverlay();
        const saveMessage = readonly
          ? " in read-only mode"
          : ". all changes will auto-save";
        notifySuccess(`Opened test${saveMessage}`);
      },
      onError: (e) => {
        notifyError("Failed to open test code.", e);
      },
    }
  );

  return (
    <AccordionAction
      onClick={(e) => {
        e.stopPropagation();
        return mutate(test.filename);
      }}
      loading={isLoading}
      icon={<EditorIcon />}
    />
  );
};
export default VerifiedTests;

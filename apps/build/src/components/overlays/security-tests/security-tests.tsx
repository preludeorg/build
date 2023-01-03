import { useMutation } from "@tanstack/react-query";
import {
  downloadTest,
  isPreludeTest,
  parseVerifiedSecurityTest,
  select,
  useAuthStore,
} from "@theprelude/core";
import {
  Accordion,
  AccordionAction,
  AccordionItem,
  AccordionList,
  EditorIcon,
  notifyError,
  notifySuccess,
  Overlay,
  useAccordion,
  VariantIcon,
} from "@theprelude/ds";
import { Test } from "@theprelude/sdk";
import shallow from "zustand/shallow";
import useNavigationStore from "../../../hooks/navigation-store";
import { useTab } from "../../../hooks/use-tab";
import { useTests } from "../../../hooks/use-tests";

const SecurityTests: React.FC = () => {
  const { data, isLoading } = useTests();
  const hideOverlay = useNavigationStore((state) => state.hideOverlay);

  return (
    <Overlay
      hideOverlay={hideOverlay}
      position="right"
      title="Security Tests"
      description="Open any test and build it to create a Verified Security Test."
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
  const accordion = useAccordion();

  const readonly = isPreludeTest(test);

  return (
    <Accordion
      title={<>{test.rule}</>}
      expanded={accordion.expanded}
      onToggle={accordion.toogle}
    >
      {test.vst && (
        <AccordionList>
          {test.vst.map((vst) => (
            <AccordionItem
              key={vst}
              title={vst}
              icon={
                <VariantIcon
                  platform={parseVerifiedSecurityTest(vst)?.platform}
                />
              }
              actions={
                <>
                  <OpenButton test={test} readonly={readonly} />
                </>
              }
            />
          ))}
        </AccordionList>
      )}
    </Accordion>
  );
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
      onClick={() => mutate(test.name)}
      loading={isLoading}
      icon={<EditorIcon />}
    />
  );
};

export default SecurityTests;

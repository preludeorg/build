import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteVariant,
  getTest,
  getVariant,
  isPreludeTest,
  parseVariant,
  select,
  useAuthStore,
} from "@theprelude/core";
import {
  Accordion,
  AccordionAction,
  AccordionItem,
  AccordionList,
  ConfirmDialog,
  EditorIcon,
  notifyError,
  notifySuccess,
  Overlay,
  Trashcan,
  useAccordion,
  VariantIcon,
} from "@theprelude/ds";
import { Test } from "@theprelude/sdk";
import shallow from "zustand/shallow";
import useNavigationStore from "../../../hooks/navigation-store";
import { useTab } from "../../../hooks/use-tab";
import { useTests } from "../../../hooks/use-tests";
import LockedTest from "../../locked-test/locked-test";

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
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const accordion = useAccordion();

  const { data, isFetching } = useQuery(
    ["variants", test.id, serviceConfig],
    () => getTest(test.id, serviceConfig),
    { enabled: accordion.expanded }
  );

  const readonly = isPreludeTest(test);

  return (
    <Accordion
      title={
        <>
          {test.question}
          {readonly && <LockedTest showTooltip />}
        </>
      }
      loading={isFetching}
      expanded={accordion.expanded}
      onToggle={accordion.toogle}
    >
      {data && (
        <AccordionList>
          {data.map((variant) => (
            <AccordionItem
              key={variant}
              title={variant}
              icon={<VariantIcon platform={parseVariant(variant)?.platform} />}
              actions={
                <>
                  <OpenButton variant={variant} readonly={readonly} />
                  {!readonly && (
                    <DeleteButton variant={variant} testId={test.id} />
                  )}
                </>
              }
            />
          ))}
        </AccordionList>
      )}
    </Accordion>
  );
};

const OpenButton: React.FC<{ variant: string; readonly: boolean }> = ({
  variant,
  readonly,
}) => {
  const { open } = useTab();
  const hideOverlay = useNavigationStore((state) => state.hideOverlay);
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const { mutate, isLoading } = useMutation(
    (variant: string) => getVariant(variant, serviceConfig),
    {
      onSuccess: async (code) => {
        open({ name: variant, code, readonly });
        hideOverlay();
        const saveMessage = readonly
          ? " in read-only mode"
          : ". all changes will auto-save";
        notifySuccess(`Opened variant${saveMessage}`);
      },
      onError: (e) => {
        notifyError("Failed to open variant.", e);
      },
    }
  );

  return (
    <AccordionAction
      onClick={() => mutate(variant)}
      loading={isLoading}
      icon={<EditorIcon />}
    />
  );
};

const DeleteButton: React.FC<{ variant: string; testId: string }> = ({
  testId,
  variant,
}) => {
  const { close } = useTab();
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(
    (variant: string) => deleteVariant(variant, serviceConfig),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["variants", testId]);
        notifySuccess("Security test variant deleted.");
        close(variant);
      },
      onError: (e) => {
        notifyError("Failed to delete security test variant.", e);
      },
    }
  );

  return (
    <ConfirmDialog
      message="Do you want to delete this variant?"
      onAffirm={() => {
        mutate(variant);
      }}
    >
      <AccordionAction loading={isLoading} icon={<Trashcan />} />
    </ConfirmDialog>
  );
};

export default SecurityTests;

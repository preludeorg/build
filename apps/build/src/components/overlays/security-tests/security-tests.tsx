import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Test } from "@theprelude/sdk";
import shallow from "zustand/shallow";
import Overlay from "../../../components/ds/overlay/overlay";
import useAuthStore from "../../../hooks/auth-store";
import useNavigationStore from "../../../hooks/navigation-store";
import { useTab } from "../../../hooks/use-tab";
import { useTests } from "../../../hooks/use-tests";
import {
  deleteVariant,
  getTest,
  getVariant,
  isPreludeTest,
} from "../../../lib/api";
import { parseVariant } from "../../../lib/utils/parse-variant";
import { select } from "../../../lib/utils/select";
import Accordion from "../../ds/accordion/accordion";
import {
  AccordionAction,
  AccordionItem,
  AccordionList,
} from "../../ds/accordion/accordion-list";
import { useAccordion } from "../../ds/accordion/use-accordion";
import ConfirmDialog from "../../ds/dialog/confirm-dialog";
import EditorIcon from "../../ds/icons/editor-icon";
import Trashcan from "../../ds/icons/trashcan-icon";
import VariantIcon from "../../ds/icons/variant-icon";
import LockedTest from "../../locked-test/locked-test";
import { notifyError, notifySuccess } from "../../notifications/notifications";

const SecurityTests: React.FC = () => {
  const { data, isLoading } = useTests();

  return (
    <Overlay
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

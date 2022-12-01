import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Test } from "@theprelude/sdk";
import shallow from "zustand/shallow";
import useAuthStore from "../../../hooks/auth-store";
import useNavigationStore from "../../../hooks/navigation-store";
import { useTab } from "../../../hooks/use-tab";
import { useTests } from "../../../hooks/use-tests";
import { deleteVariant, getTest, getVariant } from "../../../lib/api";
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
import { notifyError, notifySuccess } from "../../notifications/notifications";
import Overlay from "../../../components/ds/overlay/overlay";

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
    ["variants", test.id, serviceConfig],
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
          {data.map((variant) => (
            <AccordionItem
              key={variant}
              title={variant}
              icon={<VariantIcon platform={parseVariant(variant)?.platform} />}
              actions={
                <>
                  <OpenButton variant={variant} />
                  <DeleteButton variant={variant} testId={test.id} />
                </>
              }
            />
          ))}
        </AccordionList>
      )}
    </Accordion>
  );
};

const OpenButton: React.FC<{ variant: string }> = ({ variant }) => {
  const { open } = useTab();
  const hideOverlay = useNavigationStore((state) => state.hideOverlay);
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const { mutate, isLoading } = useMutation(
    (variant: string) => getVariant(variant, serviceConfig),
    {
      onSuccess: async (code) => {
        open({ name: variant, code });
        hideOverlay();
        notifySuccess("Opened variant. all changes will auto-save");
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

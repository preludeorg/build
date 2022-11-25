import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Test } from "@theprelude/sdk";
import { useMemo } from "react";
import shallow from "zustand/shallow";
import useAuthStore from "../../../hooks/auth-store";
import { useTests } from "../../../hooks/use-tests";
import { createURL, deleteVerified, verifiedTests } from "../../../lib/api";
import { parseBuildVariant } from "../../../lib/utils/parse-variant";
import { select } from "../../../lib/utils/select";
import Accordion from "../../ds/accordion/accordion";
import {
  AccordionAction,
  AccordionItem,
  AccordionList,
} from "../../ds/accordion/accordion-list";
import { useAccordion } from "../../ds/accordion/use-accordion";
import ConfirmDialog from "../../ds/dialog/confirm-dialog";
import CopyIcon from "../../icons/copy-icon";
import DownloadIcon from "../../icons/download-icon";
import Trashcan from "../../icons/trashcan-icon";
import VariantIcon from "../../icons/variant-icon";
import { notifyError, notifySuccess } from "../../notifications/notifications";
import Overlay from "../overlay";

const filterVST = (test: Test, vst: string[]) => {
  return vst.filter((v) => parseBuildVariant(v)?.id === test.id);
};

const VerifiedTests: React.FC = () => {
  const tests = useTests();
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const verified = useQuery(["verified-tests", serviceConfig], () =>
    verifiedTests(serviceConfig)
  );

  const isLoading = tests.isLoading || verified.isLoading;
  const testIds = useMemo(
    () => new Set(verified.data?.map((t) => parseBuildVariant(t)?.id ?? "")),
    [verified.data]
  );

  return (
    <Overlay
      loading={isLoading}
      position="right"
      title="Verified Security Tests"
      description="Verified Security Tests (VSTs) are production-ready tests. Your
    authored VSTs appear below."
    >
      {verified.data &&
        tests.data
          ?.filter((test) => testIds.has(test.id))
          .map((test) => (
            <TestItem
              key={test.id}
              test={test}
              variants={filterVST(test, verified.data)}
            />
          ))}
    </Overlay>
  );
};

const TestItem: React.FC<{
  test: Test;
  variants: string[];
}> = ({ test, variants }) => {
  const accordion = useAccordion(true);
  return (
    <Accordion
      expanded={accordion.expanded}
      onToggle={accordion.toogle}
      title={test.question}
    >
      <AccordionList>
        {variants.map((variant) => (
          <AccordionItem
            key={variant}
            title={variant}
            icon={
              <VariantIcon platform={parseBuildVariant(variant)?.platform} />
            }
            actions={
              <>
                <CopyButton variant={variant} />
                <DeleteButton variant={variant} />
              </>
            }
          />
        ))}
      </AccordionList>
    </Accordion>
  );
};

const CopyButton: React.FC<{
  variant: string;
}> = ({ variant }) => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const { data, mutate, isLoading } = useMutation(
    (variant: string) => createURL(variant, serviceConfig),
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
        onClick={() => mutate(variant)}
        icon={<DownloadIcon />}
      />
    );
  }

  return <AccordionAction onClick={handleCopy} icon={<CopyIcon />} />;
};

const DeleteButton: React.FC<{ variant: string }> = ({ variant }) => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(
    (variant: string) => deleteVerified(variant, serviceConfig),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["verified-tests"]);
        notifySuccess("Verified security test deleted.");
      },
      onError: (e) => {
        notifyError("Failed to delete verified security test", e);
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

export default VerifiedTests;

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  ConfirmDialog,
  CopyIcon,
  DownloadIcon,
  notifyError,
  notifySuccess,
  Overlay,
  Trashcan,
  useAccordion,
  VariantIcon,
} from "@theprelude/ds";
import { Test } from "@theprelude/sdk";
import { useMemo } from "react";
import shallow from "zustand/shallow";
import useNavigationStore from "../../../hooks/navigation-store";
import { useTests } from "../../../hooks/use-tests";

const filterVST = (test: Test, vst: string[]) => {
  return vst.filter((v) => parseBuildVerifiedSecurityTest(v)?.id === test.id);
};

const VerifiedTests: React.FC = () => {
  const tests = useTests();
  const verified = tests.data?.reduce((acc, test) => acc.concat(test?.vst), [] as string[]) || [] as string[];
  const isLoading = tests.isLoading;
  const testIds = useMemo(
    () => new Set(verified.map((t) => parseBuildVerifiedSecurityTest(t)?.id ?? "")),
    [verified]
  );
  const hideOverlay = useNavigationStore((state) => state.hideOverlay);

  return (
    <Overlay
      hideOverlay={hideOverlay}
      loading={isLoading}
      position="right"
      title="Verified Security Tests"
      description="Copy the URL to a VST and execute it on any host."
    >
      {verified &&
        tests.data
          ?.filter((test) => testIds.has(test.id))
          .map((test) => (
            <TestItem
              key={test.id}
              test={test}
              variants={filterVST(test, verified)}
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
      title={test.rule}
    >
      <AccordionList>
        {variants.map((variant) => (
          <AccordionItem
            key={variant}
            title={variant}
            icon={
              <VariantIcon platform={parseBuildVerifiedSecurityTest(variant)?.platform} />
            }
            actions={
              <>
                <CopyButton variant={variant} />
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

export default VerifiedTests;

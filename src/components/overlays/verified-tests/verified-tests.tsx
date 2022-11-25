import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Test } from "@theprelude/sdk";
import { useEffect, useMemo, useRef, useState } from "react";
import shallow from "zustand/shallow";
import useAuthStore from "../../../hooks/auth-store";
import { useTests } from "../../../hooks/use-tests";
import { createURL, deleteVerified, verifiedTests } from "../../../lib/api";
import { parseBuildVariant } from "../../../lib/utils/parse-variant";
import { select } from "../../../lib/utils/select";
import Accordion from "../../ds/accordion/accordion";
import {
  AccordionItem,
  AccordionList,
} from "../../ds/accordion/accordion-list";
import { useAccordion } from "../../ds/accordion/use-accordion";
import CloseIcon from "../../icons/close-icon";
import CopyIcon from "../../icons/copy-icon";
import DownloadIcon from "../../icons/download-icon";
import { Loading } from "../../icons/loading";
import Trashcan from "../../icons/trashcan-icon";
import VariantIcon from "../../icons/variant-icon";
import { notifyError, notifySuccess } from "../../notifications/notifications";
import Overlay from "../overlay";
import styles from "./verified-test.module.css";

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
    verified.data
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
        {variants.map((variant) => {
          return (
            <AccordionItem
              key={variant}
              title={variant}
              icon={
                <VariantIcon platform={parseBuildVariant(variant)?.platform} />
              }
              actions={[
                <CopyButton variant={variant} />,
                <DeleteButton variant={variant} />,
              ]}
            />
          );
        })}
      </AccordionList>
    </Accordion>
  );
};

const CopyButton: React.FC<{
  variant: string;
}> = ({ variant }) => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const [url, setURL] = useState<null | string>(null);
  const generateURL = useMutation(
    (variant: string) => createURL(variant, serviceConfig),
    {
      onSuccess: ({ url }) => {
        notifySuccess(
          "Link generated. Click the copy icon to add it to your clipboard. Link expires in 10 minutes."
        );
        setURL(url);
      },
    }
  );

  const handleCopy = async () => {
    try {
      if (!url) {
        throw new Error("no url");
      }
      await navigator.clipboard.writeText(url);
      notifySuccess("Link copied to clipboard.");
    } catch (error) {
      notifyError("Failed to copy to clipboard", error);
    }
  };

  if (generateURL.isLoading) {
    return (
      <button className={styles.copy}>
        <Loading />
      </button>
    );
  }

  if (!url) {
    return (
      <button
        onClick={() => generateURL.mutate(variant)}
        className={styles.copy}
      >
        <DownloadIcon />
      </button>
    );
  }

  return (
    <button onClick={handleCopy} className={styles.copy}>
      <CopyIcon />
    </button>
  );
};

const DeleteButton: React.FC<{ variant: string }> = ({ variant }) => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [deletePrompt, setDeletePrompt] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setDeletePrompt(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [ref.current]);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteVerified(variant, serviceConfig);
      await queryClient.invalidateQueries(["verified-tests"]);
      notifySuccess("Verified security test deleted.");
    } catch (e) {
      notifyError("Failed to delete verified security test", e);
    } finally {
      setLoading(false);
      setDeletePrompt(false);
    }
  };
  return (
    <div className={styles.deleteContainer} ref={ref}>
      <button
        onClick={() => setDeletePrompt(!deletePrompt)}
        className={styles.delete}
      >
        {loading ? <Loading /> : <Trashcan className={styles.variantIcon} />}
      </button>
      {deletePrompt ? (
        <div className={styles.deletePrompt}>
          <div className={styles.message}>
            <span>Do you want to delete this variant?</span>
            <button onClick={() => setDeletePrompt(false)}>
              <CloseIcon />
            </button>
          </div>
          <div className={styles.confirmation}>
            <button onClick={handleDelete} className={styles.approve}>
              Yes
            </button>
            <button onClick={() => setDeletePrompt(false)}>No</button>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default VerifiedTests;

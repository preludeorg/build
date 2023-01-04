import {
  createTest,
  select,
  ServiceConfig,
  Test,
  uploadTest,
  useAuthStore,
} from "@theprelude/core";
import {
  CheckmarkIcon,
  CloseIcon,
  IconButton,
  Input,
  notifyError,
  notifySuccess,
  PlusIcon,
} from "@theprelude/ds";
import { format } from "date-fns";
import { useState } from "react";
import shallow from "zustand/shallow";
import { getLanguage } from "../../lib/lang";
import * as uuid from "uuid";
import styles from "./create-test.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTab } from "../../hooks/use-tab";

const createNewTest = async (rule: string, serviceConfig: ServiceConfig) => {
  const testId = uuid.v4();
  const filename = `${testId}.go`;
  const code = getLanguage("go")
    .template.replaceAll("$NAME", testId)
    .replaceAll("$QUESTION", rule)
    .replaceAll("$CREATED", format(new Date(), "yyyy-MM-dd hh:mm:ss.SSSSSS"));
  if (serviceConfig.credentials === undefined) {
    throw new Error("Missing credentials");
  }
  await createTest(
    testId,
    rule,
    code,
    serviceConfig,
    new AbortController().signal
  );
  await uploadTest(filename, code, serviceConfig);
  const test: Test = {
    account_id: serviceConfig.credentials?.account,
    id: testId,
    filename,
    rule,
    vst: [],
  };
  return { test, code };
};

const CreateTest: React.FC<{ testsFetching: boolean }> = ({
  testsFetching,
}) => {
  const { open } = useTab();
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const [createVisible, setCreateVisible] = useState(false);
  const [rule, setRule] = useState("");
  const queryClient = useQueryClient();

  const closeCreate = () => {
    setCreateVisible(false);
    setRule("");
  };

  const { mutate, isLoading } = useMutation(
    (rule: string) => createNewTest(rule, serviceConfig),
    {
      onSuccess: async ({ test, code }) => {
        open(test, code);
        notifySuccess(`Opened test. all changes will auto-save`);
        void queryClient.invalidateQueries({
          queryKey: ["tests", serviceConfig],
        });
        closeCreate();
      },
      onError: (e) => {
        notifyError("Failed to open test code.", e);
      },
    }
  );

  const handleCreateTest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(rule);
  };

  return (
    <>
      <div className={styles.title}>
        <span>Security Tests</span>
        <IconButton
          onClick={() =>
            createVisible ? closeCreate() : setCreateVisible(true)
          }
          className={styles.create}
          icon={createVisible ? <CloseIcon /> : <PlusIcon />}
          loading={testsFetching}
          disabled={testsFetching}
        />
      </div>
      {createVisible && (
        <form onSubmit={(e) => handleCreateTest(e)} className={styles.form}>
          <Input
            type="text"
            name="rule"
            placeholder="Enter a name for the new test"
            onChange={(e) => setRule(e.target.value)}
            autoFocus={true}
          />
          <IconButton
            className={styles.submit}
            type="submit"
            intent="primary"
            disabled={rule === "" || isLoading}
            loading={isLoading}
            icon={<CheckmarkIcon />}
          >
            Create test
          </IconButton>
        </form>
      )}
    </>
  );
};

export default CreateTest;

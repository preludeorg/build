import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import * as uuid from "uuid";
import shallow from "zustand/shallow";
import useIntroStore from "../../hooks/intro-store";
import { useTab } from "../../hooks/use-tab";
import { getLanguage } from "../../lib/lang";
import { driver } from "../driver/driver";
import styles from "./create-test.module.css";

const createNewTest = async (rule: string, serviceConfig: ServiceConfig) => {
  const testId = uuid.v4();
  const filename = `${testId}.go`;
  const code = getLanguage("go")
    .template.replaceAll("$FILENAME", filename)
    .replaceAll("$RULE", rule)
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
  const { markCompleted } = useIntroStore(select("markCompleted"), shallow);
  const [createVisible, setCreateVisible] = useState(false);
  const { isFormOpen, setIsFormOpen } = useIntroStore(
    select("isFormOpen", "setIsFormOpen"),
    shallow
  );
  const [rule, setRule] = useState("");
  const queryClient = useQueryClient();

  const closeCreate = () => {
    setCreateVisible(false);
    setIsFormOpen(false);
    setRule("");
  };

  const { mutate, isLoading } = useMutation(
    (rule: string) => createNewTest(rule, serviceConfig),
    {
      onSuccess: async ({ test, code }) => {
        markCompleted("createTest");
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
    driver.reset();
    mutate(rule);
  };

  const showForm = createVisible || isFormOpen;

  return (
    <>
      <div className={styles.title}>
        <span>Security Tests</span>
        <IconButton
          onClick={() => (showForm ? closeCreate() : setCreateVisible(true))}
          className={styles.create}
          icon={showForm ? <CloseIcon /> : <PlusIcon />}
          loading={testsFetching}
          disabled={testsFetching}
        />
      </div>
      {showForm && (
        <form
          data-tooltip-id="create-test"
          onSubmit={(e) => handleCreateTest(e)}
          className={styles.form}
        >
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
          />
        </form>
      )}
    </>
  );
};

export default CreateTest;

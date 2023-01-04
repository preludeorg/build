import { createTest, select, useAuthStore } from "@theprelude/core";
import {
  CheckmarkIcon,
  IconButton,
  Input,
  notifyError,
  notifySuccess,
  PlusIcon,
} from "@theprelude/ds";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import shallow from "zustand/shallow";
import { getLanguage } from "../../lib/lang";
import * as uuid from "uuid";
import styles from "./create-test.module.css";

const CreateTest: React.FC<{ testsLoading: boolean }> = ({ testsLoading }) => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const [rule, setRule] = useState("");
  const [isLoading, setIsLoading] = useState(testsLoading);
  const [createVisible, setCreateVisible] = useState(false);

  useEffect(() => {
    if (testsLoading === false) {
      setIsLoading(false);
    }
  }, [testsLoading]);

  const handleCreateTest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const testId = uuid.v4();
    const code = getLanguage("go")
      .template.replaceAll("$NAME", testId)
      .replaceAll("$QUESTION", rule)
      .replaceAll("$CREATED", format(new Date(), "yyyy-MM-dd hh:mm:ss.SSSSSS"));
    try {
      setIsLoading(true);
      await createTest(
        testId,
        rule,
        code,
        serviceConfig,
        new AbortController().signal
      );
      notifySuccess("Successfully created test");
    } catch (err) {
      notifyError("Failed to create test", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.title}>
        <span>Security Tests</span>
        <IconButton
          onClick={() => setCreateVisible(!createVisible)}
          className={styles.create}
          icon={<PlusIcon />}
          loading={isLoading}
          disabled={isLoading}
        />
      </div>
      {createVisible && (
        <form onSubmit={(e) => handleCreateTest(e)} className={styles.form}>
          <Input
            type="text"
            name="rule"
            placeholder="Enter a name for the new test"
            onChange={(e) => setRule(e.target.value)}
          />
          <IconButton
            className={styles.submit}
            type="submit"
            intent="primary"
            disabled={rule === "" || isLoading}
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

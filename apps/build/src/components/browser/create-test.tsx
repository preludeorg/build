import { createTest, select, useAuthStore } from "@theprelude/core";
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
import { useQueryClient } from "@tanstack/react-query";

const CreateTest: React.FC<{ testsLoading: boolean }> = ({ testsLoading }) => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const [rule, setRule] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const queryClient = useQueryClient();

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
      await queryClient.invalidateQueries({
        queryKey: ["tests", serviceConfig],
      });
      notifySuccess("Successfully created test");
      setCreateVisible(false);
    } catch (err) {
      notifyError("Failed to create test", err);
    } finally {
      setIsLoading(false);
    }
  };

  const closeCreate = () => {
    setCreateVisible(false);
    setRule("");
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
          loading={testsLoading || isLoading}
          disabled={testsLoading || isLoading}
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

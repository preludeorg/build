import { createTest, select, useAuthStore } from "@theprelude/core";
import {
  Button,
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
import { Popover } from "@headlessui/react";

const CreateTest = () => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const [rule, setRule] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    <Popover>
      {({ open, close }) => (
        <>
          <Popover.Button className={styles.create}>
            <IconButton icon={<PlusIcon />} />
          </Popover.Button>
          <Popover.Panel className={styles.panel}>
            <IconButton
              onClick={close}
              icon={<CloseIcon />}
              className={styles.close}
            />
            <form onSubmit={(e) => handleCreateTest(e)} className={styles.form}>
              <Input
                type="text"
                name="rule"
                placeholder="Enter a name"
                onChange={(e) => setRule(e.target.value)}
              />
              <Button
                type="submit"
                intent="primary"
                disabled={rule === "" || isLoading}
                loading={isLoading}
              >
                Create test
              </Button>
            </form>
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

export default CreateTest;

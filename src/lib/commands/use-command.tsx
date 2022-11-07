import { Command } from "./types";
import { z, ZodError } from "zod";
import { authState } from "../../hooks/auth-store";
import styles from "../../components/terminal/command.module.css";
import { ErrorMessage } from "./helpers";

export const useCommand: Command = {
  args: "[handle]",
  desc: "register a free account with a particular user ID",
  async exec(args) {
    try {
      const { createAccount, host } = authState();
      const handle = z
        .string({
          required_error: "handle is required",
          invalid_type_error: "handle must be a string",
        })
        .min(1, { message: "handle is required" })
        .parse(args);
      await createAccount(handle);

      return (
        <div>
          Connected to {host}
          <br />
          <br />
          <span className={styles.helpText}>
            type "list-tests" to show all your Tests
          </span>
        </div>
      );
    } catch (e) {
      if (e instanceof ZodError) {
        return <ErrorMessage message={e.errors[0].message} />;
      } else {
        return (
          <ErrorMessage
            message={`failed to register account: (e as Error).message}`}
          />
        );
      }
    }
  },
};

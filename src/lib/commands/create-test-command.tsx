import { z, ZodError } from "zod";
import { authState } from "../../hooks/auth-store";
import { terminalState } from "../../hooks/terminal-store";
import { CONTEXT_SWITCH_MESSAGE } from "./messages";
import {
  ErrorMessage,
  isConnected,
  isExitError,
  isInTestContext,
  TerminalMessage,
} from "./helpers";
import { Command } from "./types";
import * as uuid from "uuid";
import { inquire } from "../../components/terminal/question";
import { createTest } from "../api";

const validator = z
  .string({
    required_error: "question is required",
  })
  .min(1, { message: "question is required" });

const getAnswer = async (args = "", signal: AbortSignal) => {
  if (args === "") {
    return await inquire({
      message: "enter a question",
      validator,
      signal,
    });
  }

  return validator.parse(args);
};

export const createTestCommand: Command = {
  args: "[question]",
  alias: ["ct"],
  desc: "create test in account",
  enabled: () => isConnected(),
  hidden: () => isInTestContext(),
  async exec(args) {
    const { switchTest, showIndicator, hideIndicator, takeControl } =
      terminalState();
    try {
      const { host, credentials } = authState();

      const signal = takeControl().signal;

      const testId = uuid.v4();
      const question = await getAnswer(args, signal);

      showIndicator("Creating test...");

      await createTest(testId, question, { host, credentials }, signal);

      switchTest({
        id: testId,
        question,
        account_id: credentials?.account ?? "",
      });

      return CONTEXT_SWITCH_MESSAGE;
    } catch (e) {
      if (isExitError(e)) {
        return <TerminalMessage message="exited" />;
      }

      if (e instanceof ZodError) {
        return <ErrorMessage message={e.errors[0].message} />;
      } else {
        return <ErrorMessage message={(e as Error).message} />;
      }
    } finally {
      hideIndicator();
    }
  },
};

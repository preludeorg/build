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
import * as Prelude from "@theprelude/sdk";
import * as uuid from "uuid";
import { inquire } from "../../components/terminal/question";

const validator = z
  .string({
    required_error: "question is required",
  })
  .min(1, { message: "question is required" });

const getAnswer = async (args = "") => {
  if (args === "") {
    return await inquire({
      question: {
        message: "enter a question",
        validator,
      },
    });
  }
  return z
    .object({
      question: validator,
    })
    .parse({ question: args });
};

export const createTestCommand: Command = {
  args: "[question]",
  alias: ["ct"],
  desc: "creates a test with a given question",
  enabled: () => isConnected(),
  hidden: () => isInTestContext(),
  async exec(args) {
    try {
      const { switchTest } = terminalState();
      const { host, credentials } = authState();

      const testId = uuid.v4();
      const { question } = await getAnswer(args);
      const service = new Prelude.Service({ host, credentials });
      await service.build.createTest(testId, question);

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
    }
  },
};

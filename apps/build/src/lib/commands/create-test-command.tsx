import { authState, createTest, Variant, createVariant } from "@theprelude/core";
import * as uuid from "uuid";
import { z, ZodError } from "zod";
import { inquire } from "../../components/terminal/question";
import {
  ErrorMessage,
  TerminalMessage,
} from "../../components/terminal/terminal-message";
import { terminalState } from "../../hooks/terminal-store";
import { isConnected, isExitError } from "./helpers";
import { Command } from "./types";
import {getLanguage} from "../lang";
import {format} from "date-fns";
import {editorState} from "../../hooks/editor-store";
import focusTerminal from "../../utils/focus-terminal";
import {navigatorState} from "../../hooks/navigation-store";

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
  hidden: () => false,
  async exec(args) {
    const { switchTest, showIndicator, hideIndicator, takeControl } =
      terminalState();
    try {
      const { navigate } = navigatorState();
      const { openTab } = editorState();
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

      let lang = 'go';
      let file = `${testId}.${lang}`;
      const code = getLanguage(lang)
          .template.replaceAll("$NAME", file)
          .replaceAll("$QUESTION", question)
          .replaceAll(
              "$CREATED",
              format(new Date(), "yyyy-MM-dd hh:mm:ss.SSSSSS")
          );
      const variant: Variant = {
        name: file,
        code,
      };
      await createVariant(variant, { host, credentials }, signal);
      openTab(variant);
      navigate("editor");
      focusTerminal();

      return <TerminalMessage message="test created" />;
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

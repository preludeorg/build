import { Command } from "./types";
import { z, ZodError } from "zod";
import { authState } from "../../hooks/auth-store";
import {
  ErrorMessage,
  isConnected,
  isExitError,
  TerminalMessage,
} from "./helpers";
import WelcomeMessage from "../../components/terminal/welcome-message";
import { inquire } from "../../components/terminal/question";
import { terminalState } from "../../hooks/terminal-store";

const validator = z
  .string({
    required_error: "handle is required",
  })
  .min(1, { message: "handle is required" });

const getAnswer = async (args = "", signal: AbortSignal) => {
  if (args === "") {
    return await inquire({
      message: "enter a handle",
      validator,
      signal,
    });
  }
  return validator.parse(args);
};

export const useCommand: Command = {
  args: "[handle]",
  desc: "create account for handle",
  hidden: () => isConnected(),
  async exec(args) {
    try {
      const { createAccount, host } = authState();
      const { takeControl } = terminalState();
      const signal = takeControl().signal;
      const handle = await getAnswer(args, signal);

      const credentials = await createAccount(handle, signal);

      return <WelcomeMessage host={host} credentials={credentials} />;
    } catch (e) {
      if (isExitError(e)) {
        return <TerminalMessage message="exited" />;
      }

      if (e instanceof ZodError) {
        return <ErrorMessage message={e.errors[0].message} />;
      } else {
        return (
          <ErrorMessage
            message={`${(e as Error).message.toLowerCase()}`}
          />
        );
      }
    }
  },
};

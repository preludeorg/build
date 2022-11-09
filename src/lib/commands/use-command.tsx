import { Command } from "./types";
import { z, ZodError } from "zod";
import { authState } from "../../hooks/auth-store";
import { ErrorMessage, isExitError, TerminalMessage } from "./helpers";
import WelcomeMessage from "../../components/terminal/welcome-message";
import { inquire } from "../../components/terminal/question";
import { terminalState } from "../../hooks/terminal-store";

const validator = z
  .string({
    required_error: "handle is required",
  })
  .min(1, { message: "handle is required" });

const getAnswer = async (args = "") => {
  if (args === "") {
    return await inquire({
      handle: {
        message: "enter a handle",
        validator,
      },
    });
  }
  return z
    .object({
      handle: validator,
    })
    .parse({ handle: args });
};

export const useCommand: Command = {
  args: "[handle]",
  desc: "register a free account with a particular user ID",
  async exec(args) {
    try {
      const { createAccount, host } = authState();
      const { takeControl } = terminalState();
      const { handle } = await getAnswer(args);

      const credentials = await createAccount(handle, takeControl().signal);

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
            message={`failed to register account: ${(e as Error).message}`}
          />
        );
      }
    }
  },
};

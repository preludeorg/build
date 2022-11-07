import { Command } from "./types";
import { z, ZodError } from "zod";
import { authState } from "../../hooks/auth-store";
import { ErrorMessage } from "./helpers";
import WelcomeMessage from "../../components/terminal/welcome-message";

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
      const credentials = await createAccount(handle);

      return <WelcomeMessage host={host} credentials={credentials} />;
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

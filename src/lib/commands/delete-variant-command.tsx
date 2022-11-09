import { terminalList } from "../../components/terminal/terminal-list";
import { authState } from "../../hooks/auth-store";
import { editorState } from "../../hooks/editor-store";
import { navigatorState } from "../../hooks/navigation-store";
import { terminalState } from "../../hooks/terminal-store";
import { getTest, deleteVariant } from "../api";
import {
  AUTH_REQUIRED_MESSAGE,
  TEST_REQUIRED_MESSAGE,
  NO_VARIANTS_MESSAGE,
} from "./messages";
import {
  ErrorMessage,
  isConnected,
  isExitError,
  TerminalMessage,
} from "./helpers";
import { Command } from "./types";

export const deleteVariantCommand: Command = {
  alias: ["dv"],
  desc: "deletes a variant from current test",
  async exec() {
    try {
      const { navigate } = navigatorState();
      const { closeTab } = editorState();
      const { currentTest, takeControl } = terminalState();
      const { host, credentials } = authState();

      const signal = takeControl().signal;

      if (!isConnected()) {
        return AUTH_REQUIRED_MESSAGE;
      }

      if (!currentTest) {
        return TEST_REQUIRED_MESSAGE;
      }

      const variants = await getTest(
        currentTest.id,
        {
          host,
          credentials,
        },
        signal
      );

      if (variants.length === 0) {
        return NO_VARIANTS_MESSAGE;
      }

      const variant = await terminalList({
        items: variants,
        keyProp: (variant) => variant,
        filterOn: (variant) => variant,
        renderItem: (variant) => (
          <>
            <span>{variant}</span>
          </>
        ),
      });

      try {
        await deleteVariant(variant, { host, credentials }, signal);

        if (!closeTab(variant)) {
          navigate("welcome");
        }

        return <TerminalMessage message={"variant deleted"} />;
      } catch (e) {
        if (isExitError(e)) {
          throw e;
        }

        return (
          <ErrorMessage
            message={`failed to delete variant: ${(e as Error).message}`}
          />
        );
      }
    } catch (e) {
      if (isExitError(e)) {
        return <TerminalMessage message="exited" />;
      }

      return (
        <ErrorMessage
          message={`failed to list variants: ${(e as Error).message}`}
        />
      );
    }
  },
};

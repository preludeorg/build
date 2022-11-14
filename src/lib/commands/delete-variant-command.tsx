import { terminalList } from "../../components/terminal/terminal-list";
import { authState } from "../../hooks/auth-store";
import { editorState } from "../../hooks/editor-store";
import { navigatorState } from "../../hooks/navigation-store";
import { terminalState } from "../../hooks/terminal-store";
import { getTest, deleteVariant } from "../api";
import { NO_VARIANTS_MESSAGE } from "./messages";
import {
  ErrorMessage,
  isConnected,
  isExitError,
  isInTestContext,
  TerminalMessage,
} from "./helpers";
import { Command } from "./types";

export const deleteVariantCommand: Command = {
  alias: ["dv"],
  desc: "delete variant from current test",
  enabled: () => isConnected() && isInTestContext(),
  async exec() {
    const { currentTest, takeControl, showIndicator, hideIndicator } =
      terminalState();
    try {
      const { navigate } = navigatorState();
      const { closeTab } = editorState();
      const { host, credentials } = authState();

      const signal = takeControl().signal;

      showIndicator("Retrieving variants...");
      const variants = await getTest(
        currentTest!.id,
        {
          host,
          credentials,
        },
        signal
      );
      hideIndicator();

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
        showIndicator("Deleting variant...");
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
    } finally {
      hideIndicator();
    }
  },
};

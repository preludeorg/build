import { terminalList } from "../../components/terminal/terminal-list";
import { authState } from "../../hooks/auth-store";
import { editorState } from "../../hooks/editor-store";
import { navigatorState } from "../../hooks/navigation-store";
import { terminalState } from "../../hooks/terminal-store";
import focusTerminal from "../../utils/focus-terminal";
import { getTest, getVariant } from "../api";
import { parseVariant } from "../utils/parse-variant";
import {
  ErrorMessage,
  isConnected,
  isExitError,
  isInTestContext,
  TerminalMessage,
} from "./helpers";
import { NO_VARIANTS_MESSAGE } from "./messages";
import { Command } from "./types";

const OPEN_ALL = "open all";

export const listVariantsCommand: Command = {
  alias: ["lv"],
  desc: "list variants in current test",
  enabled: () => isConnected() && isInTestContext(),
  async exec() {
    const { currentTest, takeControl, showIndicator, hideIndicator } =
      terminalState();
    try {
      const { navigate } = navigatorState();
      const { openTab } = editorState();
      const { host, credentials } = authState();

      const signal = takeControl().signal;

      if (!currentTest) {
        throw new Error("missing test");
      }

      showIndicator("Retrieving variants...");
      const variants = await getTest(
        currentTest.id,
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

      const shortenVariant = (v: string) => {
        const results = parseVariant(v);
        if (!results) {
          return v;
        }
        const { platform, arch, language } = results;
        return "".concat(
          platform ? platform : "*",
          arch ? `-${arch}` : "-*",
          `.${language}`
        );
      };

      const variant = await terminalList({
        items: variants.length > 1 ? [OPEN_ALL, ...variants] : variants,
        keyProp: shortenVariant,
        filterOn: shortenVariant,
        renderItem: (variant) => (
          <>
            <span>{shortenVariant(variant)}</span>
          </>
        ),
        signal,
      });

      const filesToOpen = variant === OPEN_ALL ? variants : [variant];
      try {
        showIndicator("Opening variant...");
        const variants = await Promise.all(
          filesToOpen.map(async (v) => {
            const code = await getVariant(v, { host, credentials }, signal);
            return {
              name: v,
              code,
            };
          })
        );
        variants.forEach(openTab);

        navigate("editor");
        focusTerminal();
        return (
          <TerminalMessage
            message={
              variant === OPEN_ALL
                ? "opened all variants. all changes will auto-save"
                : "opened variant. all changes will auto-save"
            }
          />
        );
      } catch (e) {
        return (
          <ErrorMessage
            message={`failed to get variant: ${(e as Error).message}`}
          />
        );
      } finally {
        hideIndicator();
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

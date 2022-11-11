import { authState } from "../../hooks/auth-store";
import { terminalState } from "../../hooks/terminal-store";
import {
  AUTH_REQUIRED_MESSAGE,
  NO_VARIANTS_MESSAGE,
  TEST_REQUIRED_MESSAGE,
} from "./messages";
import {
  ErrorMessage,
  isConnected,
  isExitError,
  TerminalMessage,
} from "./helpers";
import { Command } from "./types";
import { navigatorState } from "../../hooks/navigation-store";
import { terminalList } from "../../components/terminal/terminal-list";
import { editorState } from "../../hooks/editor-store";
import { getTest, getVariant } from "../api";
import focusTerminal from "../../utils/focus-terminal";

const VARIANT_FORMAT =
  /[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}(_\w*)?(-\w*)?\.(\w*)/i;
const OPEN_ALL = "open all";

export const listVariantsCommand: Command = {
  alias: ["lv"],
  desc: "lists the variants in current test",
  async exec() {
    const { currentTest, takeControl, showIndicator, hideIndicator } =
      terminalState();
    try {
      const { navigate } = navigatorState();
      const { openTab } = editorState();
      const { host, credentials } = authState();

      const signal = takeControl().signal;

      if (!isConnected()) {
        return AUTH_REQUIRED_MESSAGE;
      }

      if (!currentTest) {
        return TEST_REQUIRED_MESSAGE;
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
        const results = v.match(VARIANT_FORMAT);
        if (!results) {
          return v;
        }
        let [, platform, arch, language] = results;
        let shorten = "";
        shorten += platform ? platform.replaceAll("_", "") : "*";
        shorten += arch ? arch : "-*";
        shorten += `.${language}`;
        return shorten;
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
      });

      const filesToOpen = variant === OPEN_ALL ? variants : [variant];
      try {
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

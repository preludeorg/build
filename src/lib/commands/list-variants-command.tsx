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

export const listVariantsCommand: Command = {
  alias: ["lv"],
  desc: "lists the variants in current test",
  async exec() {
    try {
      const { navigate } = navigatorState();
      const { openTab } = editorState();
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

      const shortenVariant = (v: string) => {
        const results = v.match(VARIANT_FORMAT);
        if (!results) {
          return "";
        }
        let [, platform, arch, language] = results;
        let shorten = "";
        shorten += platform ? platform.replaceAll("_", "") : "*";
        shorten += arch ? arch : "-*";
        shorten += `.${language}`;
        return shorten;
      };

      const variant = await terminalList({
        items: variants,
        keyProp: shortenVariant,
        filterOn: shortenVariant,
        renderItem: (variant) => (
          <>
            <span>{shortenVariant(variant)}</span>
          </>
        ),
      });

      try {
        const code = await getVariant(variant, { host, credentials }, signal);
        openTab({
          name: variant,
          code,
        });
        navigate("editor");

        focusTerminal();

        return (
          <TerminalMessage message="opened variant. all changes will auto-save" />
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
    } finally {
    }
  },
};

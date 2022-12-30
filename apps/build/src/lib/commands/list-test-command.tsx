import { authState, getTestList, isPreludeTest } from "@theprelude/core";
import LockedTest from "../../components/locked-test/locked-test";
import { terminalList } from "../../components/terminal/terminal-list";
import {
  ErrorMessage,
  TerminalMessage,
} from "../../components/terminal/terminal-message";
import { editorState } from "../../hooks/editor-store";
import { terminalState } from "../../hooks/terminal-store";
import { isConnected, isExitError, isInTestContext } from "./helpers";
import { CONTEXT_SWITCH_MESSAGE, NO_TESTS_MESSAGE } from "./messages";
import { Command } from "./types";
import focusTerminal from "../../utils/focus-terminal";
import { navigatorState } from "../../hooks/navigation-store";
import { getLanguage } from "../lang";
import { format } from "date-fns";

export const listTestsCommand: Command = {
  alias: ["lt"],
  enabled: () => isConnected(),
  hidden: () => isInTestContext(),
  desc: "list tests in account",
  async exec() {
    const { switchTest, takeControl, showIndicator, hideIndicator } =
      terminalState();
    const { openTab } = editorState();
    const { navigate } = navigatorState();

    try {
      const { host, credentials } = authState();

      const signal = takeControl().signal;

      showIndicator("Retrieving tests...");
      const tests = await getTestList(
        {
          host,
          credentials,
        },
        signal
      );
      hideIndicator();

      if (tests.length === 0) {
        return NO_TESTS_MESSAGE;
      }

      const test = await terminalList({
        items: tests,
        keyProp: (test) => test.id,
        filterOn: (test) => test.question,
        renderItem: (test) => (
          <>
            <span style={{ display: "flex", alignItems: "center" }}>
              {test.question}{" "}
              {isPreludeTest(test) && <LockedTest showTooltip />}{" "}
            </span>{" "}
            <span>[{test.id}]</span>
          </>
        ),
        signal,
      });

      switchTest(test);

      const code = getLanguage("go")
        .template.replaceAll("$NAME", test.id)
        .replaceAll("$QUESTION", test.question)
        .replaceAll(
          "$CREATED",
          format(new Date(), "yyyy-MM-dd hh:mm:ss.SSSSSS")
        );

      openTab({ name: test.id, code });
      navigate("editor");
      focusTerminal();

      return CONTEXT_SWITCH_MESSAGE;
    } catch (e) {
      if (isExitError(e)) {
        return <TerminalMessage message="exited" />;
      }

      return (
        <ErrorMessage
          message={`failed to list tests: ${(e as Error).message}`}
        />
      );
    } finally {
      hideIndicator();
    }
  },
};

import { terminalList } from "../../components/terminal/terminal-list";
import { authState } from "../../hooks/auth-store";
import { terminalState } from "../../hooks/terminal-store";
import { getTestList } from "../api";
import {
  AUTH_REQUIRED_MESSAGE,
  CONTEXT_SWITCH_MESSAGE,
  NO_TESTS_MESSAGE,
} from "./messages";
import {
  ErrorMessage,
  isConnected,
  isExitError,
  TerminalMessage,
} from "./helpers";
import { Command } from "./types";

export const listTestsCommand: Command = {
  alias: ["lt"],
  desc: "lists the tests accesible by your account",
  async exec() {
    const { switchTest, takeControl, showIndicator, hideIndicator } =
      terminalState();
    try {
      const { host, credentials } = authState();

      if (!isConnected()) {
        return AUTH_REQUIRED_MESSAGE;
      }

      showIndicator("Retrieving tests...");
      const tests = await getTestList(
        {
          host,
          credentials,
        },
        takeControl().signal
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
            <span>{test.question}</span> <span>[{test.id}]</span>
          </>
        ),
      });

      switchTest(test);
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
    }
  },
};

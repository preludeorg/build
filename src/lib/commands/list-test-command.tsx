import { teminalList } from "../../components/terminal/terminal-list";
import { authState } from "../../hooks/auth-store";
import { terminalState } from "../../hooks/terminal-store";
import { getTestList } from "../test";
import {
  AUTH_REQUIRED_MESSAGE,
  CONTEXT_SWITCH_MESSAGE,
  NO_TESTS_MESSAGE,
} from "./messages";
import { ErrorMessage, isConnected } from "./helpers";
import { Command } from "./types";

export const listTestsCommand: Command = {
  alias: ["lt"],
  desc: "lists the tests accesible by your account",
  async exec() {
    try {
      const { switchTest } = terminalState();
      const { host, credentials } = authState();

      if (!isConnected()) {
        return AUTH_REQUIRED_MESSAGE;
      }

      const tests = await getTestList({
        host,
        credentials,
      });

      if (tests.length === 0) {
        return NO_TESTS_MESSAGE;
      }

      const test = await teminalList({
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
      return (
        <ErrorMessage
          message={`failed to list tests: ${(e as Error).message}`}
        />
      );
    }
  },
};

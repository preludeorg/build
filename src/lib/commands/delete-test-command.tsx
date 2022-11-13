import { authState } from "../../hooks/auth-store";
import { terminalState } from "../../hooks/terminal-store";
import {
  ErrorMessage,
  isConnected,
  isExitError,
  isInTestContext,
  TerminalMessage,
} from "./helpers";
import { Command } from "./types";
import { editorState } from "../../hooks/editor-store";
import { navigatorState } from "../../hooks/navigation-store";
import { deleteTest, getTestList } from "../api";
import { NO_TESTS_MESSAGE } from "./messages";
import { terminalList } from "../../components/terminal/terminal-list";

export const deleteTestCommand: Command = {
  alias: ["dt"],
  desc: "deletes a test",
  enabled: () => isConnected(),
  hidden: () => isInTestContext(),
  async exec() {
    const {
      currentTest,
      switchTest,
      takeControl,
      showIndicator,
      hideIndicator,
    } = terminalState();
    try {
      const { closeTab, tabs } = editorState();
      const { host, credentials } = authState();
      const { navigate } = navigatorState();

      const tests = await getTestList(
        {
          host,
          credentials,
        },
        takeControl().signal
      );

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

      showIndicator("Deleting test...");
      await deleteTest(test.id, { host, credentials }, takeControl().signal);

      Object.keys(tabs).forEach((id) => {
        if (tabs[id].variant.name.startsWith(test.id)) {
          closeTab(id);
        }
      });

      if (Object.keys(editorState().tabs).length === 0) {
        navigate("welcome");
      }

      if (currentTest?.id === test.id) {
        switchTest();
      }

      return <TerminalMessage message="test deleted" />;
    } catch (e) {
      if (isExitError(e)) {
        return <TerminalMessage message="exited" />;
      }

      return (
        <ErrorMessage
          message={`failed to delete test: ${(e as Error).message}`}
        />
      );
    } finally {
      hideIndicator();
    }
  },
};

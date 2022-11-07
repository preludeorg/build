import { authState } from "../../hooks/auth-store";
import { terminalState } from "../../hooks/terminal-store";
import { AUTH_REQUIRED_MESSAGE, TEST_REQUIRED_MESSAGE } from "./consts";
import { ErrorMessage, isConnected, TerminalMessage } from "./helpers";
import { Command } from "./types";
import { editorState } from "../../hooks/editor-store";
import { navigatorState } from "../../hooks/navigation-store";
import { deleteTest } from "../test";

export const deleteTestCommand: Command = {
  alias: ["dt"],
  desc: "deletes current test",
  async exec() {
    try {
      const { closeTab, tabs } = editorState();
      const { currentTest, switchTest } = terminalState();
      const { host, credentials } = authState();
      const { navigate } = navigatorState();

      if (!isConnected()) {
        return AUTH_REQUIRED_MESSAGE;
      }

      if (!currentTest) {
        return TEST_REQUIRED_MESSAGE;
      }

      await deleteTest(currentTest.id, { host, credentials });

      Object.keys(tabs).forEach((id) => {
        if (tabs[id].variant.name.startsWith(currentTest.id)) {
          closeTab(id);
        }
      });

      if (Object.keys(editorState().tabs).length === 0) {
        navigate("welcome");
      }

      switchTest();

      return <TerminalMessage message="test deleted" />;
    } catch (e) {
      return (
        <ErrorMessage
          message={`failed to delete test: ${(e as Error).message}`}
        />
      );
    }
  },
};

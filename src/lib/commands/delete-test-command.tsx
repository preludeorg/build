import { authState } from "../../hooks/auth-store";
import { terminalState } from "../../hooks/terminal-store";
import { AUTH_REQUIRED_MESSAGE, TEST_REQUIRED_MESSAGE } from "./messages";
import {
  ErrorMessage,
  isConnected,
  isExitError,
  TerminalMessage,
} from "./helpers";
import { Command } from "./types";
import { editorState } from "../../hooks/editor-store";
import { navigatorState } from "../../hooks/navigation-store";
import { deleteTest } from "../api";

export const deleteTestCommand: Command = {
  alias: ["dt"],
  desc: "deletes current test",
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

      if (!isConnected()) {
        return AUTH_REQUIRED_MESSAGE;
      }

      if (!currentTest) {
        return TEST_REQUIRED_MESSAGE;
      }

      showIndicator("Deleting test...");
      await deleteTest(
        currentTest.id,
        { host, credentials },
        takeControl().signal
      );
      hideIndicator();

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
      if (isExitError(e)) {
        return <TerminalMessage message="exited" />;
      }

      return (
        <ErrorMessage
          message={`failed to delete test: ${(e as Error).message}`}
        />
      );
    }
  },
};

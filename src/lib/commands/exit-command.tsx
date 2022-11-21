import { TerminalMessage } from "../../components/terminal/terminal-message";
import { terminalState } from "../../hooks/terminal-store";
import { isConnected, isInTestContext } from "./helpers";
import { Command } from "./types";

export const exitCommand: Command = {
  alias: ["e"],
  desc: "exit current test context",
  enabled: () => isConnected() && isInTestContext(),
  async exec() {
    const { switchTest } = terminalState();
    switchTest();
    return <TerminalMessage message={"exited test context"} />;
  },
};

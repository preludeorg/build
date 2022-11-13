import { terminalState } from "../../hooks/terminal-store";
import { isConnected, isInTestContext, TerminalMessage } from "./helpers";
import { Command } from "./types";

export const exitCommand: Command = {
  alias: ["e"],
  desc: "exits current test context",
  enabled: () => isConnected() && isInTestContext(),
  async exec() {
    const { switchTest } = terminalState();
    switchTest();
    return <TerminalMessage message={"exited test context"} />;
  },
};

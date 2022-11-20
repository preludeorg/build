import { authState } from "../../hooks/auth-store";
import { terminalState } from "../../hooks/terminal-store";

export const isConnected = () => !!authState().credentials;
export const isInTestContext = () => !!terminalState().currentTest;

export const isExitError = (e: unknown) => {
  if (!(e instanceof Error)) {
    return false;
  }
  return e.message === "exited" || e.message === "The user aborted a request.";
};

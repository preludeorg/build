import { authState, isPreludeTest } from "@theprelude/core";
import { terminalState } from "../../hooks/terminal-store";
export const isConnected = () => !!authState().credentials;
export const isInTestContext = () => !!terminalState().currentTest;

export const isPreludeTestContext = () => {
  const currentTest = terminalState().currentTest;
  return currentTest && isPreludeTest(currentTest);
};

export const isExitError = (e: unknown) => {
  if (!(e instanceof Error)) {
    return false;
  }
  return e.message === "exited" || e.message === "The user aborted a request.";
};

import { TerminalMessage } from "./helpers";

export const AUTH_REQUIRED_MESSAGE = (
  <TerminalMessage
    message="account is required to run this command."
    helpText={`type "use"`}
  />
);

export const TEST_REQUIRED_MESSAGE = (
  <TerminalMessage
    message="test is required to execute command."
    helpText={`type "list-tests" to show all your tests`}
  />
);

export const NO_TESTS_MESSAGE = (
  <TerminalMessage
    message="no tests found."
    helpText={`type "create-test" to create a test`}
  />
);

export const NO_VARIANTS_MESSAGE = (
  <TerminalMessage
    message="no variants in test."
    helpText={`type "create-variant" to create a variant`}
  />
);

export const CONTEXT_SWITCH_MESSAGE = (
  <TerminalMessage
    message="switched context."
    helpText={`type "list-variants" to choose an implementation`}
  />
);

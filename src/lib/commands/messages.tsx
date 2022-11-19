import { TerminalMessage } from "../../components/terminal/terminal-message";

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

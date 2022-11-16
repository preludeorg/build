import { Test } from "@theprelude/sdk";
import create from "zustand";
import { commands } from "../lib/commands";
import PrimaryPrompt from "../components/terminal/primary-prompt";
import styles from "../components/terminal/terminal.module.css";
import { commonBeginning } from "../lib/utils/common-beginning";
import { TerminalMessage } from "../lib/commands/helpers";

function splitStringAtIndex(value: string, index: number) {
  if (!value) {
    return ["", ""];
  }
  return [value.substring(0, index), value.substring(index)];
}

interface TerminalStore {
  currentTest?: Test;
  focused: boolean;
  inputEnabled: boolean;
  input: string;
  caretPosition: number;
  commandsHistory: string[];
  historyPointer: number;
  bufferedContent: Array<string | JSX.Element>;
  abortController?: AbortController;
  setFocus: (focused: boolean) => void;
  clear: () => void;
  reset: () => void;
  handleKey: (event: KeyboardEvent) => Promise<void>;
  processCommand: () => void;
  write: (content: string | JSX.Element) => void;
  switchTest: (test?: Test) => void;
  autoComplete: () => void;
  takeControl: () => AbortController;
  abort: () => void;
  statusIndicator?: {
    message: string;
    loading: boolean;
  };
  showIndicator: (message: string) => void;
  hideIndicator: () => void;
}

const useTerminalStore = create<TerminalStore>((set, get) => ({
  inputEnabled: true,
  focused: false,
  input: "",
  caretPosition: 0,
  bufferedContent: [],
  commandsHistory: [],
  historyPointer: 0,

  setFocus: (focused: boolean) => {
    set(() => ({ focused }));
  },
  autoComplete: () => {
    const { input } = get();
    const options = Object.keys(commands).filter((o) => o.startsWith(input));
    if (input === "" || options.length === 0) {
      return;
    }

    if (options.length === 1) {
      set(() => ({
        input: options[0],
        caretPosition: options[0].length + 1,
      }));
    } else {
      set((state) => {
        const waiting = (
          <>
            <PrimaryPrompt test={state.currentTest}>
              <span className={styles.preWhiteSpace}>{input}</span>
            </PrimaryPrompt>
            <div style={{ color: "var(--color-primary-10)" }}>
              {options.join(" ")}
            </div>
          </>
        );

        return {
          bufferedContent: [...state.bufferedContent, waiting],
          input: commonBeginning(options),
          caretPosition: commonBeginning(options).length + 1,
        };
      });
    }
  },
  takeControl() {
    const { abortController } = get();
    /** abort previous requests */
    abortController?.abort();

    const controller = new AbortController();
    set(() => ({ abortController: controller }));
    return controller;
  },
  abort: () => {
    const { input, abortController, inputEnabled } = get();
    abortController?.abort();

    if (!inputEnabled) {
      return;
    }

    set((state) => {
      const waiting = (
        <>
          <PrimaryPrompt test={state.currentTest}>
            <span className={styles.preWhiteSpace}>{input}</span>
          </PrimaryPrompt>
        </>
      );

      return {
        bufferedContent: [...state.bufferedContent, waiting],
        input: "",
        caretPosition: 0,
      };
    });
  },
  clear() {
    set(() => ({
      bufferedContent: [],
      input: "",
      caretPosition: 0,
    }));
  },
  reset() {
    set(() => ({
      currentTest: undefined,
      bufferedContent: [],
      input: "",
      caretPosition: 0,
    }));
  },
  switchTest(test?: Test) {
    set(() => ({ currentTest: test }));
  },
  async handleKey(event: KeyboardEvent) {
    const { focused, inputEnabled } = get();
    if (!focused || !inputEnabled) {
      return;
    }

    const eventKey = event.key;

    let { input, caretPosition, historyPointer, commandsHistory } = get();
    let nextInput: string | null = null;

    if (eventKey === "Backspace") {
      const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
        input,
        caretPosition
      );
      nextInput = caretTextBefore.slice(0, -1) + caretTextAfter;
      if (input && input.length !== 0) {
        caretPosition = caretPosition - 1;
      }
    } else if (eventKey === "ArrowUp") {
      nextInput = getPreviousCommand(historyPointer, commandsHistory);
      if (historyPointer > 0) {
        historyPointer = historyPointer - 1;
      }
      if (nextInput) {
        caretPosition = nextInput.length;
      }
    } else if (eventKey === "ArrowDown") {
      nextInput = getNextCommand(historyPointer, commandsHistory);
      if (historyPointer + 1 <= commandsHistory.length) {
        historyPointer = historyPointer + 1;
      }
      if (nextInput) {
        caretPosition = nextInput.length;
      } else {
        caretPosition = 0;
      }
    } else if (eventKey === "ArrowLeft") {
      if (caretPosition > 0) {
        caretPosition = caretPosition - 1;
      }
      nextInput = input;
    } else if (eventKey === "ArrowRight") {
      if (caretPosition < input.length) {
        caretPosition = caretPosition + 1;
      }
      nextInput = input;
    } else if (
      (event.metaKey || event.ctrlKey) &&
      eventKey.toLowerCase() === "v"
    ) {
      const pastedText = await navigator.clipboard.readText();
      const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
        input || "",
        caretPosition
      );
      nextInput = caretTextBefore + pastedText + caretTextAfter;
      caretPosition = caretPosition + pastedText.length;
    } else if (
      (event.metaKey || event.ctrlKey) &&
      eventKey.toLowerCase() === "c"
    ) {
      const selectedText = window.getSelection()?.toString();
      if (!selectedText) return;
      await navigator.clipboard.writeText(selectedText);
      nextInput = input;
    } else {
      if (eventKey && eventKey.length === 1) {
        const [caretTextBefore, caretTextAfter] = splitStringAtIndex(
          input,
          caretPosition
        );
        nextInput = caretTextBefore + eventKey + caretTextAfter;
        caretPosition = caretPosition + 1;
      } else {
        nextInput = input;
      }
    }
    set(() => ({
      input: nextInput ?? "",
      processInput: false,
      caretPosition,
      historyPointer,
    }));
  },
  async processCommand() {
    const { input, commandsHistory } = get();
    const [commandName, ...rest] = input.trim().split(" ");
    let output: string | JSX.Element = "";

    if (input !== "") {
      set(() => {
        const commands = [...commandsHistory, input];
        return {
          commandsHistory: commands,
          historyPointer: commands.length,
        };
      });
    }

    if (commandName === "clear") {
      set(() => ({
        bufferedContent: [],
        input: "",
        caretPosition: 0,
      }));
      return;
    }

    set((state) => {
      const waiting = (
        <PrimaryPrompt test={state.currentTest}>
          <span className={styles.preWhiteSpace}>{input}</span>
        </PrimaryPrompt>
      );

      return {
        bufferedContent: [...state.bufferedContent, waiting],
        input: "",
        caretPosition: 0,
        inputEnabled: false,
      };
    });

    if (commandName === "") {
      set(() => ({
        inputEnabled: true,
      }));
      return;
    }

    const commandArguments = rest.join(" ");
    const commandKey = Object.keys(commands).find(
      (c) => commandName === c || commands[c].alias?.includes(commandName)
    );
    const command = commandKey ? commands[commandKey] : null;
    const isEnabled = command?.enabled?.() ?? true;

    if (command && isEnabled) {
      output = await command.exec(commandArguments);
    } else if (command && !isEnabled) {
      output = (
        <TerminalMessage
          message={`command "${commandName}" is unavailable.`}
          helpText={`type "help" to list avaliable commmands`}
        />
      );
    } else {
      output = `command not found: ${commandName}`;
    }

    set((state) => {
      const nextBufferedContent = <span>{output}</span>;

      return {
        bufferedContent: [...state.bufferedContent, nextBufferedContent],
        input: "",
        inputEnabled: true,
      };
    });
  },
  write(content) {
    set((state) => ({
      bufferedContent: [...state.bufferedContent, content],
    }));
  },
  showIndicator(message) {
    set(() => {
      return {
        statusIndicator: { message: message, loading: true },
      };
    });
  },
  hideIndicator() {
    set(() => {
      return {
        statusIndicator: { message: "", loading: false },
      };
    });
  },
}));

const getPreviousCommand = (
  historyPointer: number,
  commandsHistory: string[]
) => {
  if (historyPointer === 0) {
    if (commandsHistory.length === 0) {
      return "";
    }

    return commandsHistory[0];
  }

  const command = commandsHistory[historyPointer - 1];

  return command;
};

const getNextCommand = (historyPointer: number, commandsHistory: string[]) => {
  if (historyPointer + 1 <= commandsHistory.length) {
    const command = commandsHistory[historyPointer + 1];

    return command;
  }

  return "";
};

export default useTerminalStore;

export const selectCaretText = (state: TerminalStore) => {
  const [beforeCaretText, afterCaretText] = splitStringAtIndex(
    state.input,
    state.caretPosition
  );

  return [beforeCaretText, afterCaretText];
};

export const terminalState = () => useTerminalStore.getState();

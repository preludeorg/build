import { Test } from "@theprelude/sdk";
import * as uuid from "uuid";
import create from "zustand";
import { CurrentLine } from "../components/terminal/terminal";
import { TerminalMessage } from "../components/terminal/terminal-message";
import { commands } from "../lib/commands";
import { commonBeginning } from "../lib/utils/common-beginning";

export function splitStringAtIndex(value: string, index: number) {
  if (!value) {
    return ["", ""];
  }
  return [value.substring(0, index), value.substring(index)];
}

export function getSuggestions(input: string) {
  return Object.keys(commands).filter((o) => o.startsWith(input));
}

interface Content {
  key: React.Key;
  content: JSX.Element;
}

const print = (element: JSX.Element): Content => {
  return { key: uuid.v4(), content: element };
};

interface TerminalStore {
  currentTest?: Test;
  hasFocusable: boolean;
  commandsHistory: string[];
  bufferedContent: Array<Content>;
  abortController?: AbortController;
  setFocusable: (focused: boolean) => void;
  clear: () => void;
  reset: () => void;
  processCommand: (input: string) => void;
  write: (content: JSX.Element) => void;
  switchTest: (test?: Test) => void;
  autoComplete: (options: string[]) => void;
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
  hasFocusable: false,
  bufferedContent: [],
  commandsHistory: [],
  setFocusable: (hasFocusable: boolean) => {
    set(() => ({ hasFocusable }));
  },
  autoComplete: (options: string[]) => {
    set((state) => {
      return {
        bufferedContent: [
          ...state.bufferedContent,
          print(
            <div style={{ color: "var(--color-primary-10)" }}>
              {options.join(" ")}
            </div>
          ),
          print(<CurrentLine input={commonBeginning(options)} />),
        ],
      };
    });
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
    const { abortController } = get();
    abortController?.abort();

    set((state) => {
      return {
        bufferedContent: [
          ...state.bufferedContent,
          print(<CurrentLine currentTest={state.currentTest} />),
        ],
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

  async processCommand(input) {
    try {
      const { commandsHistory } = get();
      const [commandName, ...rest] = input.trim().split(" ");
      let output: JSX.Element = <></>;

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
        set((state) => ({
          bufferedContent: [
            print(<CurrentLine currentTest={state.currentTest} />),
          ],
        }));
        return;
      }

      if (commandName === "") {
        set((state) => ({
          bufferedContent: [
            ...state.bufferedContent,
            print(<CurrentLine currentTest={state.currentTest} />),
          ],
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
        output = (
          <TerminalMessage message={`command not found: ${commandName}`} />
        );
      }

      set((state) => {
        return {
          bufferedContent: [
            ...state.bufferedContent,
            print(output),
            print(<CurrentLine currentTest={state.currentTest} />),
          ],
        };
      });
    } catch (err) {}
  },
  write(content) {
    const { hasFocusable } = get();
    if (!hasFocusable) {
      set((state) => ({
        bufferedContent: [...state.bufferedContent, print(content)],
      }));
    } else {
      set((state) => {
        const newBufferedContent = [...state.bufferedContent];
        newBufferedContent.splice(
          newBufferedContent.length - 1,
          0,
          print(content)
        );
        return {
          bufferedContent: newBufferedContent,
        };
      });
    }
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

export const getPreviousCommand = (
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

export const getNextCommand = (
  historyPointer: number,
  commandsHistory: string[]
) => {
  if (historyPointer + 1 <= commandsHistory.length) {
    const command = commandsHistory[historyPointer + 1];

    return command;
  }

  return "";
};

export default useTerminalStore;

export const terminalState = () => useTerminalStore.getState();

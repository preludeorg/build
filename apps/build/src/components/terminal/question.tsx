import { useState } from "react";
import {
  ParseParams,
  SafeParseReturnType,
  z,
  ZodInvalidEnumValueIssue,
} from "zod";
import { terminalState } from "../../hooks/terminal-store";
import { combine, ModifierKeys, press, SpecialKeys } from "../../lib/keyboard";
import styles from "./commands.module.css";
import Readline, { useReadline } from "./readline";

interface Validator {
  options?: string[];
  safeParse(
    data: unknown,
    params?: Partial<ParseParams>
  ): SafeParseReturnType<unknown, unknown>;
}

interface QuestionProps {
  message: string;
  defaultValue?: string;
  validator?: Validator;
  onAnswer: (answer: string) => void;
  onInvalidAnswer: (invalid: string) => void;
  onExit: () => void;
  signal?: AbortSignal;
}

export const Question: React.FC<QuestionProps> = ({
  message,
  defaultValue,
  onExit,
  onAnswer,
  onInvalidAnswer,
  validator = z.string() as Validator,
}) => {
  const [error, setError] = useState<string | null>(null);

  const readline = useReadline({
    extraMacros: ({ input, terminate }) => [
      press(SpecialKeys.ESCAPE, combine(ModifierKeys.CTRL, "c")).do(() => {
        terminate();
        onExit();
      }),

      press(SpecialKeys.ENTER).do(() => {
        terminate();
        const value = input.trim();
        if (value === "" && defaultValue) {
          onAnswer(defaultValue);
          return;
        }

        if (value === "") {
          onInvalidAnswer(value);
          return;
        }

        const result = validator.safeParse(value);

        if (result.success) {
          onAnswer(result.data as string);
        } else {
          const e = result.error;
          if (e.errors[0].code === "invalid_enum_value") {
            const error = e.errors[0] as ZodInvalidEnumValueIssue;
            setError(
              `error: "${error.received}" is not one of: ${error.options.join(
                " | "
              )}`
            );
          } else {
            setError(result.error.message);
          }

          onInvalidAnswer(value);
        }
      }),
    ],
  });

  const choice = Array.isArray(validator.options)
    ? `(${validator.options.join(", ")})`
    : null;
  const def = defaultValue ? `[${defaultValue}]` : null;

  return (
    <>
      <div className={styles.question}>
        <span className={styles.message}>
          {[message, choice, def].filter((m) => !!m).join(" ")}:
        </span>
        <Readline {...readline} />
      </div>
      {error && <div>{error}</div>}
    </>
  );
};

export async function question(
  props: Omit<QuestionProps, "onExit" | "onAnswer" | "onInvalidAnswer">
): Promise<string> {
  return new Promise((resolve, reject) => {
    const { write } = terminalState();
    write(
      <Question
        {...props}
        onAnswer={(item) => {
          resolve(item);
        }}
        onExit={() => {
          reject(new Error("exited"));
        }}
        onInvalidAnswer={() => {
          reject(new Error("invalidAnswer"));
        }}
      />
    );
  });
}

interface Question {
  message: string;
  choices?: readonly string[];
  defaultValue?: string;
  validator?: Validator;
  signal: AbortSignal;
}

export async function inquire(quest: Question): Promise<string> {
  while (true) {
    try {
      return await question(quest);
    } catch (err) {
      if ((err as Error).message === "invalidAnswer") {
        continue;
      }
      throw err;
    }
  }
}

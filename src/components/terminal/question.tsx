import { useEffect, useRef, useState } from "react";
import {
  ParseParams,
  SafeParseReturnType,
  z,
  ZodInvalidEnumValueIssue,
} from "zod";
import { terminalState } from "../../hooks/terminal-store";
import { isControlC } from "../../lib/keys";
import focusTerminal from "../../utils/focus-terminal";
import styles from "./commands.module.css";

interface Validator {
  options?: string[];
  safeParse(
    data: unknown,
    params?: Partial<ParseParams>
  ): SafeParseReturnType<any, any>;
}

interface QuestionProps {
  message: string;
  defaultValue?: string;
  validator?: Validator;
  onAnswer: (answer: string) => void;
  onInvalidAnswer: (invalid: string) => void;
  onExit: () => void;
}

export const Question: React.FC<QuestionProps> = ({
  message,
  defaultValue,
  onExit,
  onAnswer,
  onInvalidAnswer,
  validator = z.string() as Validator,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef.current]);

  const handleKey: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Escape" || isControlC(e)) {
      e.preventDefault();
      const value = inputRef.current?.value ?? "";

      setAnswer(value);

      onExit();
      focusTerminal();
      return false;
    }

    if (e.key === "Enter") {
      e.preventDefault();

      const value = (inputRef.current?.value ?? "").trim();

      setAnswer(value);

      if (value === "" && defaultValue) {
        onAnswer(defaultValue);
        focusTerminal();
        return;
      }

      if (value === "") {
        onInvalidAnswer(value);
        focusTerminal();
        return;
      }

      const result = validator.safeParse(value);

      if (result.success) {
        onAnswer(result.data);
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

      focusTerminal();
      return false;
    }

    return true;
  };

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
        {answer === null ? (
          <input ref={inputRef} type="text" onKeyDown={handleKey} />
        ) : (
          <span>{answer}</span>
        )}
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

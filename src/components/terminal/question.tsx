import { useEffect, useRef, useState } from "react";
import { z, ZodInvalidEnumValueIssue, ZodTypeAny } from "zod";
import { terminalState } from "../../hooks/terminal-store";
import focusTerminal from "../../utils/focus-terminal";
import styles from "./commands.module.css";

interface QuestionProps {
  message: string;
  defaultValue?: string;
  validator?: ZodTypeAny;
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
  validator = z.string(),
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef.current]);

  const handleKey: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Escape") {
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
            `error: "${error.received}" is not one of : ${error.options.join(
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

  const choices =
    (validator as unknown as { options?: string[] }).options ?? [];
  const choice = (validator as unknown as { options?: string[] }).options
    ? ` (${choices.join(", ")})`
    : "";
  const def = defaultValue ? ` [${defaultValue}]` : "";

  return (
    <>
      <div className={styles.question}>
        <span className={styles.message}>
          {message}
          {choice}
          {def}:
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
  validator?: ZodTypeAny;
}

type Questions = Record<string, Question>;

export async function inquire<T extends Questions>(
  questions: T
): Promise<{ [x in keyof T]: string }> {
  const answers: Record<string, string> = {};
  for (const [key, ques] of Object.entries(questions)) {
    while (true) {
      try {
        answers[key] = await question(ques);
        break;
      } catch (err) {
        if ((err as Error).message === "invalidAnswer") {
          continue;
        }

        throw err;
      }
    }
  }

  return answers as { [x in keyof T]: string };
}

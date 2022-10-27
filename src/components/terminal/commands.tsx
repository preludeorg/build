import { z, ZodError } from "zod";
import { authState } from "../../hooks/auth-store";
import { editorState } from "../../hooks/editor-store";
import { navigatorState } from "../../hooks/navigation-store";
import Swift from "../../lib/lang/swift";
import styles from "./commands.module.css";

type CommandReturn = string | JSX.Element | Promise<string | JSX.Element>;
interface Command {
  title?: string;
  desc?: string | JSX.Element;
  exec: (args: string) => CommandReturn;
}
export type Commands = Record<string, Command>;

export const commands: Commands = {
  login: {
    title: "login <email>",
    desc: "logs into the default prelude instance with an email address",
    async exec(args) {
      try {
        const { createAccount, host } = authState();
        const email = z.string().email().parse(args);
        await createAccount(email);

        return (
          <>
            <br />
            Connected to {host}
            <br />
            <br />
            Type “help” for a list of commands <br />
          </>
        );
      } catch (e) {
        if (e instanceof ZodError) {
          return e.errors[0].message;
        } else {
          return (e as Error).message;
        }
      }
    },
  },
  "list-manifest": {
    desc: "lists the manifest of ttps accesible by your account",
    exec() {
      return `command not implemented`;
    },
  },
  open: {
    exec() {
      const { navigate } = navigatorState();
      const { openTab } = editorState();
      navigate("editor");
      const filename = `linux-${Date.now()}-x84.swift`;
      openTab({
        name: filename,
        code: new Swift().bootstrap(),
      });

      return `opened ${filename} in editor`;
    },
  },

  help: {
    exec() {
      const commandsList = Object.keys(commands).map((command) => ({
        name: commands[command].title ?? command,
        desc: commands[command].desc ?? "",
      }));
      return (
        <div className={styles.help}>
          <br />
          <strong>Commands</strong>
          <ul>
            {commandsList.map((command) => (
              <li key={command.name}>
                <span>{command.name}</span> <p>{command.desc}</p>{" "}
              </li>
            ))}
          </ul>
        </div>
      );
    },
  },
};

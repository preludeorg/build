import { z, ZodError } from "zod";
import { authState } from "../../hooks/auth-store";
import styles from "./commands.module.css";
import * as Prelude from "@theprelude/sdk";
import * as uuid from "uuid";
import ListManifest from "./list-manifest";
import { terminalState } from "../../hooks/terminal-store";
import { getLanguageMode } from "../../lib/lang";

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
            Type “list-manifest” to show all your ttps <br />
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
    async exec() {
      const { write } = terminalState();

      return new Promise((resolve) => {
        write(<ListManifest unlock={resolve} />);
      });
    },
  },
  "put-ttp": {
    title: "put-ttp <question>",
    desc: "creates a ttp with a given question",
    async exec(args) {
      try {
        const { isConnected, host, credentials } = authState();
        if (!isConnected) {
          return "login is required to execute command";
        }

        const ttpId = uuid.v4();
        const question = z
          .string({
            required_error: "question is required",
            invalid_type_error: "question must be a string",
          })
          .min(5, { message: "question must be 5 or more characters long" })
          .parse(args);

        const service = new Prelude.Service({ host, credentials });
        await service.build.createTTP(ttpId, question);

        return <span className={styles.success}>Added: {ttpId}</span>;
      } catch (e) {
        if (e instanceof ZodError) {
          return e.errors[0].message;
        } else {
          return (e as Error).message;
        }
      }
    },
  },
  "create-code-file": {
    title: "create-code-file <ttp> <platform> <arch> <language>",
    desc: "creates a ttp with a given question",
    async exec(args) {
      try {
        const { isConnected, host, credentials } = authState();
        if (!isConnected) {
          return "login is required to execute command";
        }

        const [ttpId, platform, arch, language] = args.split(" ");

        const file = `${ttpId}_${platform}-${arch}.${language}`;

        const service = new Prelude.Service({ host, credentials });
        await service.build.putCodeFile(
          `${ttpId}_${platform}-${arch}.${language}`,
          getLanguageMode(language).bootstrap()
        );

        return <span className={styles.success}>created code file {file}</span>;
      } catch (e) {
        return (
          <span className={styles.error}>
            failed to create code file: {(e as Error).message}
          </span>
        );
      }
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

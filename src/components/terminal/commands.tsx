import { z, ZodError } from "zod";
import { authState } from "../../hooks/auth-store";
import styles from "./commands.module.css";
import * as Prelude from "@theprelude/sdk";
import * as uuid from "uuid";
import { terminalState } from "../../hooks/terminal-store";
import { getLanguageMode } from "../../lib/lang";
import TerminalList from "./terminal-list";
import { getCodeFile, getManifest, getTTP, TTP } from "../../lib/ttp";
import { editorState } from "../../hooks/editor-store";
import { navigatorState } from "../../hooks/navigation-store";

type CommandReturn = string | JSX.Element | Promise<string | JSX.Element>;
interface Command {
  title?: string;
  desc?: string | JSX.Element;
  exec: (args: string) => CommandReturn;
}
export type Commands = Record<string, Command>;

export const commands: Commands = {
  login: {
    title: "login <user_handle>",
    desc: "logs into the default prelude instance with a handle",
    async exec(args) {
      try {
        const { createAccount, host } = authState();
        const handle = z
          .string({
            required_error: "handle is required",
            invalid_type_error: "handle must be a string",
          })
          .min(1, { message: "handle is required" })
          .parse(args);
        await createAccount(handle);

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
      return new Promise(async (resolve) => {
        const { write, switchTTP } = terminalState();
        const { isConnected, host, credentials } = authState();

        if (!isConnected) {
          return resolve("login is required to execute command");
        }

        const manifest = (await getManifest({
          host,
          credentials,
        })) as unknown as Record<string, { question: string }>;

        const ttps: TTP[] = Object.keys(manifest).map((id) => ({
          id,
          question: manifest[id].question,
        }));

        if (ttps.length === 0) {
          return resolve("no ttps in manifest");
        }

        write(
          <TerminalList
            title={<strong>Manifest List</strong>}
            items={ttps}
            keyProp={(ttp) => ttp.id}
            renderItem={(ttp) => (
              <>
                <span>{ttp.question}</span> - <span>{ttp.id}</span>
              </>
            )}
            onSelect={(ttp) => {
              switchTTP(ttp);
              resolve(
                <span>
                  switched to ttp: <strong>{ttp.question}</strong> - {ttp.id}
                </span>
              );
            }}
            onExit={() => {
              resolve("no ttp selected");
            }}
          />
        );
      });
    },
  },
  "put-ttp": {
    title: "put-ttp <question>",
    desc: "creates a ttp with a given question",
    async exec(args) {
      try {
        const { switchTTP } = terminalState();
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
          .min(1, { message: "question is required" })
          .parse(args);

        const service = new Prelude.Service({ host, credentials });
        await service.build.createTTP(ttpId, question);

        switchTTP({ id: ttpId, question });

        return (
          <span>
            created and switched to ttp:{" "}
            <strong>
              {question} - {ttpId}
            </strong>
          </span>
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
  "list-files": {
    desc: "lists the code files in current ttp",
    async exec() {
      return new Promise(async (resolve) => {
        try {
          const { navigate } = navigatorState();
          const { openTab } = editorState();
          const { write, currentTTP } = terminalState();
          const { isConnected, host, credentials } = authState();

          if (!isConnected) {
            return resolve("login is required to execute command");
          }

          if (!currentTTP) {
            return resolve("ttp is required to execute command");
          }

          const files = await getTTP(currentTTP.id, {
            host,
            credentials,
          });

          if (files.length === 0) {
            return resolve("no code files in ttp");
          }

          const handleSelect = async (file: string) => {
            try {
              const code = await getCodeFile(file, { host, credentials });
              openTab({
                name: file,
                code,
              });
              navigate("editor");
              resolve(
                <span>
                  opened code file: <strong>{file}</strong> in editor
                </span>
              );
            } catch (e) {
              resolve(
                <span>failed to get code file: {(e as Error).message}</span>
              );
            }
          };

          write(
            <TerminalList
              title={<strong>Code Files</strong>}
              items={files}
              keyProp={(file) => file}
              renderItem={(file) => (
                <>
                  <span>{file}</span>
                </>
              )}
              onSelect={(file) => {
                handleSelect(file);
              }}
              onExit={() => {
                resolve("no code file selected");
              }}
            />
          );
        } catch (e) {
          resolve(`failed to list code files: ${(e as Error).message}`);
        }
      });
    },
  },
  "create-file": {
    title: "create-file <platform> <arch> <language>",
    desc: "creates a new code file in current ttp",
    async exec(args) {
      try {
        const { navigate } = navigatorState();
        const { openTab } = editorState();
        const { isConnected, host, credentials } = authState();
        if (!isConnected) {
          return "login is required to execute command";
        }

        const { currentTTP } = terminalState();

        if (!currentTTP) {
          return "ttp is required to execute command";
        }

        const [platform, arch, language] = args.split(" ");

        const file = `${currentTTP.id}_${platform}-${arch}.${language}`;

        const service = new Prelude.Service({ host, credentials });
        await service.build.putCodeFile(
          `${currentTTP.id}_${platform}-${arch}.${language}`,
          getLanguageMode(language).bootstrap()
        );

        const code = await getCodeFile(file, { host, credentials });
        openTab({
          name: file,
          code,
        });
        navigate("editor");

        return (
          <span>
            created and opened code file: <strong>{file}</strong>
          </span>
        );
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

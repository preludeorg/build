import { z, ZodError, ZodInvalidEnumValueIssue } from "zod";
import { authState } from "../../hooks/auth-store";
import styles from "./commands.module.css";
import * as Prelude from "@theprelude/sdk";
import * as uuid from "uuid";
import { terminalState } from "../../hooks/terminal-store";
import { getLanguageMode } from "../../lib/lang";
import TerminalList, { TerminalListProps } from "./terminal-list";
import {
  deleteCodeFile,
  deleteTTP,
  getCodeFile,
  getManifest,
  getTTP,
  TTP,
} from "../../lib/ttp";
import { editorState } from "../../hooks/editor-store";
import { navigatorState } from "../../hooks/navigation-store";

type CommandReturn = string | JSX.Element | Promise<string | JSX.Element>;
interface Command {
  title?: string;
  desc?: string | JSX.Element;
  exec: (args: string) => CommandReturn;
}
export type Commands = Record<string, Command>;

type ListerProps<T> = Omit<TerminalListProps<T>, "onSelect" | "onExit">;
async function lister<T extends {}>({
  title,
  items,
  keyProp,
  renderItem,
}: ListerProps<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const { write } = terminalState();
    write(
      <TerminalList
        title={title}
        items={items}
        keyProp={keyProp}
        renderItem={renderItem}
        onSelect={(ttp) => {
          resolve(ttp);
        }}
        onExit={() => {
          reject(new Error("exited"));
        }}
      />
    );
  });
}
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
      try {
        const { switchTTP } = terminalState();
        const { isConnected, host, credentials } = authState();

        if (!isConnected) {
          return "login is required to execute command";
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
          return "no ttps in manifest";
        }

        const ttp = await lister({
          title: <strong>Manifest List</strong>,
          items: ttps,
          keyProp: (ttp) => ttp.id,
          renderItem: (ttp) => (
            <>
              <span>{ttp.question}</span> - <span>{ttp.id}</span>
            </>
          ),
        });

        switchTTP(ttp);
        return (
          <span>
            switched to ttp: <strong>{ttp.question}</strong> - {ttp.id}
          </span>
        );
      } catch (e) {
        return (e as Error).message;
      }
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
  "list-code-files": {
    desc: "lists the code files in current ttp",
    async exec() {
      try {
        const { navigate } = navigatorState();
        const { openTab } = editorState();
        const { currentTTP } = terminalState();
        const { isConnected, host, credentials } = authState();

        if (!isConnected) {
          return "login is required to execute command";
        }

        if (!currentTTP) {
          return "ttp is required to execute command";
        }

        const files = await getTTP(currentTTP.id, {
          host,
          credentials,
        });

        if (files.length === 0) {
          return "no code files in ttp";
        }

        const file = await lister({
          title: <strong>Code Files</strong>,
          items: files,
          keyProp: (file) => file,
          renderItem: (file) => (
            <>
              <span>{file}</span>
            </>
          ),
        });

        try {
          const code = await getCodeFile(file, { host, credentials });
          openTab({
            name: file,
            code,
          });
          navigate("editor");
          return (
            <span>
              opened code file: <strong>{file}</strong> in editor
            </span>
          );
        } catch (e) {
          return <span>failed to get code file: {(e as Error).message}</span>;
        }
      } catch (e) {
        if ((e as Error).message === "exited") {
          return "no code file selected";
        }

        return `failed to list code files: ${(e as Error).message}`;
      }
    },
  },
  "delete-code-file": {
    desc: "deletes a code files from current ttp",
    async exec() {
      try {
        const { navigate } = navigatorState();
        const { closeTab } = editorState();
        const { currentTTP } = terminalState();
        const { isConnected, host, credentials } = authState();

        if (!isConnected) {
          return "login is required to execute command";
        }

        if (!currentTTP) {
          return "ttp is required to execute command";
        }

        const files = await getTTP(currentTTP.id, {
          host,
          credentials,
        });

        if (files.length === 0) {
          return "no code files in ttp";
        }

        const file = await lister({
          title: <strong>Choose a code file to delete</strong>,
          items: files,
          keyProp: (file) => file,
          renderItem: (file) => (
            <>
              <span>{file}</span>
            </>
          ),
        });

        try {
          await deleteCodeFile(file, { host, credentials });
          if (closeTab(file)) {
            navigate("welcome");
          }

          return (
            <span>
              code file: <strong>{file}</strong> deleted
            </span>
          );
        } catch (e) {
          return (
            <span>failed to delete code file: {(e as Error).message}</span>
          );
        }
      } catch (e) {
        if ((e as Error).message === "exited") {
          return "no code file selected";
        }

        return `failed to list code files: ${(e as Error).message}`;
      }
    },
  },
  "create-code-file": {
    title: "create-code-file <platform> <arch> <language>",
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

        const input = args.split(" ");

        const { platform, arch, language } = z
          .object({
            platform: z.enum(["*", "darwin", "linux"]),
            arch: z.enum(["*", "arm64", "x86_64"]),
            language: z.enum(["c", "cs", "swift"]),
          })
          .parse({
            platform: input[0] ?? "",
            arch: input[1] ?? "",
            language: input[2] ?? "",
          });

        let file = `${currentTTP.id}`;
        if (platform !== "*") {
          file += `_${platform}`;

          if (arch !== "*") {
            file += `-${arch}`;
          }
        }

        file += `.${language}`;

        const service = new Prelude.Service({ host, credentials });
        await service.build.putCodeFile(
          file,
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
        if (
          e instanceof ZodError &&
          e.errors[0].code === "invalid_enum_value"
        ) {
          const error = e.errors[0] as ZodInvalidEnumValueIssue;
          return `invalid ${error.path[0]} input:  received: "${
            error.received
          }" expected: ${error.options.join(" | ")}`;
        } else {
          return (
            <span className={styles.error}>
              failed to create code file: {(e as Error).message}
            </span>
          );
        }
      }
    },
  },
  "delete-ttp": {
    desc: "deletes current ttp",
    async exec() {
      try {
        const { closeTab, tabs } = editorState();
        const { currentTTP, switchTTP } = terminalState();
        const { isConnected, host, credentials } = authState();

        if (!isConnected) {
          return "login is required to execute command";
        }

        if (!currentTTP) {
          return "ttp is required to execute command";
        }

        await deleteTTP(currentTTP.id, { host, credentials });

        Object.keys(tabs).forEach((id) => {
          if (tabs[id].dcf.name.startsWith(currentTTP.id)) {
            closeTab(id);
          }
        });

        switchTTP();

        return <span>ttp: {currentTTP.id} was deleted</span>;
      } catch (e) {
        return `failed to delete ttp: ${(e as Error).message}`;
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
                <span>{command.name}</span> <p>{command.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      );
    },
  },
};

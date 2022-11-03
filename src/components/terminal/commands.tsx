import { z, ZodError, ZodInvalidEnumValueIssue } from "zod";
import { authState } from "../../hooks/auth-store";
import styles from "./commands.module.css";
import * as Prelude from "@theprelude/sdk";
import * as uuid from "uuid";
import { terminalState } from "../../hooks/terminal-store";
import { getLanguageMode } from "../../lib/lang";
import { teminalList } from "./terminal-list";
import {
  deleteTest,
  deleteTTP,
  getManifest,
  getTest,
  getTTP,
  TTP,
} from "../../lib/ttp";
import { editorState } from "../../hooks/editor-store";
import { navigatorState } from "../../hooks/navigation-store";
import { DCF } from "../../lib/dcf";
import { format } from "date-fns";

type CommandReturn = string | JSX.Element | Promise<string | JSX.Element>;
interface Command {
  title?: string;
  desc?: string | JSX.Element;
  exec: (args: string) => CommandReturn;
}
export type Commands = Record<string, Command>;

export const commands: Commands = {
  use: {
    title: "use <handle>",
    desc: "register a free account with a particular user ID",
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

        const ttp = await teminalList({
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
            switched context. type 'list-tests' to choose a implementation.
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
            switched context. type 'list-tests' to choose a implementation.
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
  "list-tests": {
    desc: "lists the tests in current ttp",
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

        const tests = await getTTP(currentTTP.id, {
          host,
          credentials,
        });

        if (tests.length === 0) {
          return "no tests in ttp";
        }

        const test = await teminalList({
          items: tests,
          keyProp: (test) => test,
          renderItem: (test) => (
            <>
              <span>{test}</span>
            </>
          ),
        });

        try {
          const code = await getTest(test, { host, credentials });
          openTab({
            name: test,
            code,
          });
          navigate("editor");
          return <span>opened test all changes will auto-save</span>;
        } catch (e) {
          return <span>failed to get test: {(e as Error).message}</span>;
        }
      } catch (e) {
        if ((e as Error).message === "exited") {
          return "no test selected";
        }

        return `failed to list tests: ${(e as Error).message}`;
      }
    },
  },
  "delete-test": {
    desc: "deletes a test from current ttp",
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

        const tests = await getTTP(currentTTP.id, {
          host,
          credentials,
        });

        if (tests.length === 0) {
          return "no test in ttp";
        }

        const test = await teminalList({
          items: tests,
          keyProp: (test) => test,
          renderItem: (test) => (
            <>
              <span>{test}</span>
            </>
          ),
        });

        try {
          await deleteTest(test, { host, credentials });

          if (closeTab(test)) {
            navigate("welcome");
          }

          return <span>test deleted</span>;
        } catch (e) {
          return <span>failed to delete test: {(e as Error).message}</span>;
        }
      } catch (e) {
        if ((e as Error).message === "exited") {
          return "no test selected";
        }

        return `failed to list tests: ${(e as Error).message}`;
      }
    },
  },
  "create-test": {
    title: "create-test <platform> <arch> <language>",
    desc: "creates a new test in the current ttp",
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
        const code = getLanguageMode(language)
          .bootstrap()
          .replaceAll("$NAME", file)
          .replaceAll("$QUESTION", currentTTP.question)
          .replaceAll(
            "$CREATED",
            format(new Date(), "yyyy-mm-dd hh:mm:ss.SSSSSS")
          );

        const dcf: DCF = {
          name: file,
          code,
        };

        const service = new Prelude.Service({ host, credentials });
        await service.build.putTest(dcf.name, dcf.code, true);
        openTab(dcf);
        navigate("editor");

        return <span>created and opened test</span>;
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
              failed to create test: {(e as Error).message}
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

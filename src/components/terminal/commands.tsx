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
  deleteVariant,
  getTest,
  getTestList,
  getVariant,
} from "../../lib/test";
import { editorState } from "../../hooks/editor-store";
import { navigatorState } from "../../hooks/navigation-store";
import { Variant } from "../../lib/variant";
import { format } from "date-fns";

type CommandReturn = string | JSX.Element | Promise<string | JSX.Element>;
interface Command {
  title?: string;
  alias?: string[];
  desc?: string | JSX.Element;
  exec: (args: string) => CommandReturn;
}

export type Commands = Record<string, Command>;

const isConnected = () => !!authState().credentials;
const VARIANT_FORMAT =
  /[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}(_\w*)?(-\w*)?\.(\w*)/i;
const AUTH_REQUIRED_MESSAGE =
  "account is required to run this command. Type use <handle>";

const AUTH_REQUIRED_MESSAGE = (
  <>
    <span>account is required to run this command.</span>
    <span className={styles.helpText}>type use {"<handle"}</span>
  </>
);

(" ");

const TEST_REQUIRED_MESSAGE = (
  <>
    <span>test is required to execute command.</span>
    <span className={styles.helpText}>
      type "list-tests" to show all your Tests
    </span>
  </>
);

const NO_TESTS_MESSAGE = (
  <>
    <span>no tests found.</span>
    <span className={styles.helpText}>type "create-test" to create a test</span>
  </>
);

const NO_VARIANTS_MESSAGE = (
  <>
    <span>no variants in test.</span>
    <span className={styles.helpText}>
      type "create-variant" to create a variant"
    </span>
  </>
);

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
          <div>
            Connected to {host}
            <br />
            <br />
            <span className={styles.helpText}>
              type "list-tests" to show all your Tests
            </span>
          </div>
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
    alias: ["lt"],
    desc: "lists the tests accesible by your account",
    async exec() {
      try {
        const { switchTest } = terminalState();
        const { host, credentials } = authState();

        if (!isConnected()) {
          return AUTH_REQUIRED_MESSAGE;
        }

        const tests = await getTestList({
          host,
          credentials,
        });

        if (tests.length === 0) {
          return NO_TESTS_MESSAGE;
        }

        const test = await teminalList({
          items: tests,
          keyProp: (test) => test.id,
          filterOn: (test) => test.question,
          renderItem: (test) => (
            <>
              <span>{test.question}</span> - <span>{test.id}</span>
            </>
          ),
        });

        switchTest(test);
        return (
          <span>
            switched context.
            <span className={styles.helpText}>
              type "list-variants" to choose an implementation
            </span>
          </span>
        );
      } catch (e) {
        return (e as Error).message;
      }
    },
  },
  "create-test": {
    title: "create-test <question>",
    alias: ["ct"],
    desc: "creates a test with a given question",
    async exec(args) {
      try {
        const { switchTest } = terminalState();
        const { host, credentials } = authState();

        if (!isConnected()) {
          return AUTH_REQUIRED_MESSAGE;
        }

        const testId = uuid.v4();
        const question = z
          .string({
            required_error: "question is required",
            invalid_type_error: "question must be a string",
          })
          .min(1, { message: "question is required" })
          .parse(args);

        const service = new Prelude.Service({ host, credentials });
        await service.build.createTest(testId, question);

        switchTest({
          id: testId,
          question,
          account_id: credentials?.account ?? "",
        });

        return (
          <span>
            switched context.
            <span className={styles.helpText}>
              type "list-variants" to choose an implementation
            </span>
          </span>
        );
      } catch (e) {
        if (e instanceof ZodError) {
          return <span className={styles.error}>{e.errors[0].message}</span>;
        } else {
          return <span className={styles.error}>{(e as Error).message}</span>;
        }
      }
    },
  },
  "delete-test": {
    alias: ["dt"],
    desc: "deletes current test",
    async exec() {
      try {
        const { closeTab, tabs } = editorState();
        const { currentTest, switchTest } = terminalState();
        const { host, credentials } = authState();
        const { navigate } = navigatorState();

        if (!isConnected()) {
          return AUTH_REQUIRED_MESSAGE;
        }

        if (!currentTest) {
          return TEST_REQUIRED_MESSAGE;
        }

        await deleteTest(currentTest.id, { host, credentials });

        Object.keys(tabs).forEach((id) => {
          if (tabs[id].variant.name.startsWith(currentTest.id)) {
            closeTab(id);
          }
        });

        if (Object.keys(editorState().tabs).length === 0) {
          navigate("welcome");
        }

        switchTest();

        return <span>test deleted</span>;
      } catch (e) {
        return (
          <span className={styles.error}>
            failed to delete test: {(e as Error).message}
          </span>
        );
      }
    },
  },
  "list-variants": {
    alias: ["lv"],
    desc: "lists the variants in current test",
    async exec() {
      try {
        const { navigate } = navigatorState();
        const { openTab } = editorState();
        const { currentTest } = terminalState();
        const { host, credentials } = authState();

        if (!isConnected()) {
          return AUTH_REQUIRED_MESSAGE;
        }

        if (!currentTest) {
          return TEST_REQUIRED_MESSAGE;
        }

        const variants = await getTest(currentTest.id, {
          host,
          credentials,
        });

        if (variants.length === 0) {
          return NO_VARIANTS_MESSAGE;
        }

        const shortenVariant = (v: string) => {
          const results = v.match(VARIANT_FORMAT);
          if (!results) {
            return "";
          }
          let [all, platform, arch, language] = results;
          let shorten = "";
          shorten += platform ? platform.replaceAll("_", "") : "*";
          shorten += arch ? arch : "-*";
          shorten += `.${language}`;
          return shorten;
        };

        const variant = await teminalList({
          items: variants,
          keyProp: (variant) => variant,
          filterOn: (variant) => variant,
          renderItem: (variant) => (
            <>
              <span>{shortenVariant(variant)}</span>
            </>
          ),
        });

        try {
          const code = await getVariant(variant, { host, credentials });
          openTab({
            name: variant,
            code,
          });
          navigate("editor");
          return <span>opened variant. all changes will auto-save</span>;
        } catch (e) {
          return (
            <span className={styles.error}>
              failed to get variant: {(e as Error).message}
            </span>
          );
        }
      } catch (e) {
        if ((e as Error).message === "exited") {
          return "no variant selected";
        }

        return (
          <span className={styles.error}>
            failed to list variants: {(e as Error).message}
          </span>
        );
      }
    },
  },
  "delete-variant": {
    alias: ["dv"],
    desc: "deletes a variant from current test",
    async exec() {
      try {
        const { navigate } = navigatorState();
        const { closeTab } = editorState();
        const { currentTest } = terminalState();
        const { host, credentials } = authState();

        if (!isConnected()) {
          return AUTH_REQUIRED_MESSAGE;
        }

        if (!currentTest) {
          return TEST_REQUIRED_MESSAGE;
        }

        const variants = await getTest(currentTest.id, {
          host,
          credentials,
        });

        if (variants.length === 0) {
          return NO_VARIANTS_MESSAGE;
        }

        const variant = await teminalList({
          items: variants,
          keyProp: (variant) => variant,
          filterOn: (variant) => variant,
          renderItem: (variant) => (
            <>
              <span>{variant}</span>
            </>
          ),
        });

        try {
          await deleteVariant(variant, { host, credentials });

          if (!closeTab(variant)) {
            navigate("welcome");
          }

          return <span className={styles.error}>variant deleted</span>;
        } catch (e) {
          return (
            <span className={styles.error}>
              failed to delete variant: {(e as Error).message}
            </span>
          );
        }
      } catch (e) {
        if ((e as Error).message === "exited") {
          return <span className={styles.error}>no variant selected</span>;
        }

        return (
          <span className={styles.error}>
            failed to list variants: {(e as Error).message}
          </span>
        );
      }
    },
  },
  "create-variant": {
    title: "create-variant <platform> <arch> <language>",
    alias: ["cv"],
    desc: "creates a new variant in the current test",
    async exec(args) {
      try {
        const { navigate } = navigatorState();
        const { openTab } = editorState();
        const { host, credentials } = authState();

        if (!isConnected()) {
          return AUTH_REQUIRED_MESSAGE;
        }

        const { currentTest } = terminalState();

        if (!currentTest) {
          return TEST_REQUIRED_MESSAGE;
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

        let file = `${currentTest.id}`;
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
          .replaceAll("$QUESTION", currentTest.question)
          .replaceAll(
            "$CREATED",
            format(new Date(), "yyyy-mm-dd hh:mm:ss.SSSSSS")
          );

        const variant: Variant = {
          name: file,
          code,
        };

        const service = new Prelude.Service({ host, credentials });
        await service.build.createVariant(variant.name, variant.code);
        openTab(variant);
        navigate("editor");

        return (
          <span>created and opened variant. all changes will auto-save</span>
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
              failed to create variant: {(e as Error).message}
            </span>
          );
        }
      }
    },
  },
  help: {
    exec() {
      const commandsList = Object.keys(commands).map((command) => ({
        name: commands[command].title ?? command,
        desc: commands[command].desc ?? "",
        alias: commands[command].alias ?? [],
      }));
      return (
        <div className={styles.help}>
          <strong>Commands</strong>
          <ul>
            {commandsList.map((command) => (
              <li key={command.name}>
                <span>{command.name}</span> <p>{command.desc} </p>
                {command.alias.length !== 0 ? (
                  <strong>[aliases: {command.alias.join(", ")}]</strong>
                ) : (
                  ""
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    },
  },
};

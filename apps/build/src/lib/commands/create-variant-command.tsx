import {
  authState,
  createVariant,
  getVariant,
  Variant,
  variantExists,
} from "@theprelude/core";
import { format } from "date-fns";
import { z, ZodError, ZodInvalidEnumValueIssue } from "zod";
import { inquire } from "../../components/terminal/question";
import {
  ErrorMessage,
  TerminalMessage,
} from "../../components/terminal/terminal-message";
import { editorState } from "../../hooks/editor-store";
import { navigatorState } from "../../hooks/navigation-store";
import { terminalState } from "../../hooks/terminal-store";
import focusTerminal from "../../utils/focus-terminal";
import { getLanguage } from "../lang";
import {
  isConnected,
  isExitError,
  isInTestContext,
  isPreludeTestContext,
} from "./helpers";
import { Command } from "./types";

const platformValidator = z.enum(["*", "darwin", "linux", "windows"]);
const archValidator = z.enum(["*", "arm64", "x86_64"]);
const languageValidator = z.enum(["c", "cs", "swift", "go"]);

const getAnswers = async (args: string, signal: AbortSignal) => {
  if (args === "") {
    const platform = await inquire({
      message: "select a platform",
      validator: platformValidator,
      defaultValue: "*",
      signal,
    });

    const arch =
      platform !== "*"
        ? await inquire({
            message: "select an architecture",
            validator: archValidator,
            defaultValue: "*",
            signal,
          })
        : "*";

    const language = await inquire({
      message: "select a language",
      validator: languageValidator,
      signal,
    });

    return { platform, arch, language };
  }

  const input = args.split(" ");
  return z
    .object({
      platform: platformValidator,
      arch: archValidator,
      language: languageValidator,
    })
    .parse({
      platform: input[0] ?? "",
      arch: input[1] ?? "",
      language: input[2] ?? "",
    });
};

export const createVariantCommand: Command = {
  alias: ["cv"],
  args: "[platform] [arch] [language]",
  desc: "create variant in current test",
  enabled: () => isConnected() && isInTestContext() && !isPreludeTestContext(),
  async exec(args) {
    const { takeControl, currentTest, showIndicator, hideIndicator } =
      terminalState();
    try {
      const { navigate } = navigatorState();
      const { openTab } = editorState();
      const { host, credentials } = authState();
      const signal = takeControl().signal;

      const results = await getAnswers(args, signal);

      const { platform, arch, language } = results;

      if (!currentTest) {
        throw new Error("missing test");
      }

      let file = `${currentTest.id}`;
      if (platform !== "*") {
        file += `_${platform}`;

        if (arch !== "*") {
          file += `-${arch}`;
        }
      }

      file += `.${language}`;

      showIndicator("Checking if variant exists...");
      const exists = await variantExists(
        currentTest.id,
        file,
        { host, credentials },
        signal
      );
      hideIndicator();

      if (exists) {
        const confirm = await inquire({
          message: "do you want to overwrite exisiting variant?",
          validator: z.enum(["yes", "no"]),
          defaultValue: "no",
          signal,
        });

        if (confirm === "no") {
          const code = await getVariant(file, { host, credentials }, signal);
          openTab({ name: file, code });
          navigate("editor");
          focusTerminal();
          return (
            <TerminalMessage
              message={"opened variant. all changes will auto-save"}
            />
          );
        }
      }

      const code = getLanguage(language)
        .template.replaceAll("$NAME", file)
        .replaceAll("$QUESTION", currentTest.question)
        .replaceAll(
          "$CREATED",
          format(new Date(), "yyyy-MM-dd hh:mm:ss.SSSSSS")
        );

      const variant: Variant = {
        name: file,
        code,
      };

      showIndicator("Creating variant...");
      await createVariant(variant, { host, credentials }, signal);
      openTab(variant);
      navigate("editor");
      focusTerminal();
      return (
        <TerminalMessage message="created and opened variant. all changes will auto-save" />
      );
    } catch (e) {
      if (isExitError(e)) {
        return <TerminalMessage message="exited" />;
      }

      if (e instanceof ZodError && e.errors[0].code === "invalid_enum_value") {
        const error = e.errors[0] as ZodInvalidEnumValueIssue;
        return (
          <ErrorMessage
            message={`invalid ${error.path[0]} input:  received: "${
              error.received
            }" expected: ${error.options.join(" | ")}`}
          />
        );
      }

      return (
        <ErrorMessage
          message={`failed to create variant: ${(e as Error).message}`}
        />
      );
    } finally {
      hideIndicator();
    }
  },
};

import { format } from "date-fns";
import { z, ZodError, ZodInvalidEnumValueIssue } from "zod";
import { authState } from "../../hooks/auth-store";
import { editorState } from "../../hooks/editor-store";
import { navigatorState } from "../../hooks/navigation-store";
import { terminalState } from "../../hooks/terminal-store";
import { getLanguage } from "../lang";

import {
  ErrorMessage,
  isConnected,
  isExitError,
  isInTestContext,
  TerminalMessage,
} from "./helpers";
import { Command } from "./types";
import { inquire } from "../../components/terminal/question";
import focusTerminal from "../../utils/focus-terminal";
import { createVariant, getVariant, Variant, variantExists } from "../api";

const platformValidator = z.enum(["*", "darwin", "linux"]);
const archValidator = z.enum(["*", "arm64", "x86_64"]);
const languageValidator = z.enum(["c", "cs", "swift"]);

const getAnswers = async (args: string) => {
  if (args === "") {
    return await inquire({
      platform: {
        message: "select a platform",
        validator: platformValidator,
        defaultValue: "*",
      },
      arch: {
        message: "select an architecture",
        validator: archValidator,
        defaultValue: "*",
      },
      language: {
        message: "select a language",
        validator: languageValidator,
      },
    });
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
  desc: "creates a new variant in the current test",
  enabled: () => isConnected() && isInTestContext(),
  async exec(args) {
    const { takeControl, currentTest, showIndicator, hideIndicator } =
      terminalState();
    try {
      const { navigate } = navigatorState();
      const { openTab } = editorState();
      const { host, credentials } = authState();
      const signal = takeControl().signal;

      const results = await getAnswers(args);

      const { platform, arch, language } = results;

      let file = `${currentTest!.id}`;
      if (platform !== "*") {
        file += `_${platform}`;

        if (arch !== "*") {
          file += `-${arch}`;
        }
      }

      file += `.${language}`;

      showIndicator("Checking if variant exists...");
      const exists = await variantExists(
        currentTest!.id,
        file,
        { host, credentials },
        signal
      );
      hideIndicator();

      if (exists) {
        const { confirm } = await inquire({
          confirm: {
            message: "do you want to overwrite exisiting variant?",
            validator: z.enum(["yes", "no"]),
            defaultValue: "no",
          },
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
        .bootstrap.replaceAll("$NAME", file)
        .replaceAll("$QUESTION", currentTest!.question)
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

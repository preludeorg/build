import { Service } from "@theprelude/sdk";
import { format } from "date-fns";
import { z, ZodError, ZodInvalidEnumValueIssue } from "zod";
import { authState } from "../../hooks/auth-store";
import { editorState } from "../../hooks/editor-store";
import { navigatorState } from "../../hooks/navigation-store";
import { terminalState } from "../../hooks/terminal-store";
import { getLanguageMode } from "../lang";
import { Variant } from "../variant";
import { AUTH_REQUIRED_MESSAGE, TEST_REQUIRED_MESSAGE } from "./consts";
import { ErrorMessage, isConnected, TerminalMessage } from "./helpers";
import { Command } from "./types";

export const createVariantCommand: Command = {
  alias: ["cv"],
  args: "[platform] [arch] [language]",
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

      const service = new Service({ host, credentials });
      await service.build.createVariant(variant.name, variant.code);
      openTab(variant);
      navigate("editor");

      return (
        <TerminalMessage message="created and opened variant. all changes will auto-save" />
      );
    } catch (e) {
      if (e instanceof ZodError && e.errors[0].code === "invalid_enum_value") {
        const error = e.errors[0] as ZodInvalidEnumValueIssue;
        return (
          <ErrorMessage
            message={`invalid ${error.path[0]} input:  received: "${
              error.received
            }" expected: ${error.options.join(" | ")}`}
          />
        );
      } else {
        return (
          <ErrorMessage
            message={`failed to create variant: ${(e as Error).message}`}
          />
        );
      }
    }
  },
};

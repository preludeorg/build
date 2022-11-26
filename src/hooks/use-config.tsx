import ini from "ini";
import { z } from "zod";
import shallow from "zustand/shallow";
import { notifyError } from "../components/notifications/notifications";
import {
  ErrorMessage,
  TerminalMessage,
} from "../components/terminal/terminal-message";
import { isExitError } from "../lib/commands/helpers";
import { select } from "../lib/utils/select";
import focusTerminal from "../utils/focus-terminal";
import useAuthStore from "./auth-store";
import useEditorStore from "./editor-store";
import useNavigationStore from "./navigation-store";
import useTerminalStore from "./terminal-store";

const readAsText = (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      if (typeof event.target?.result === "string") {
        resolve(event.target?.result);
      }
      reject(new Error("failed to read file"));
    });
    reader.readAsText(file);
  });
};

const configSchema = z.object({
  default: z.object({
    hq: z.string().url(),
    account: z.string(),
    token: z.string(),
  }),
});

export const useConfig = () => {
  const { login, host, credentials } = useAuthStore(
    select("login", "host", "credentials"),
    shallow
  );

  const {
    takeControl,
    write,
    reset: resetTerminal,
    showIndicator,
    hideIndicator,
  } = useTerminalStore(
    select("takeControl", "write", "reset", "showIndicator", "hideIndicator"),
    shallow
  );

  const resetEditor = useEditorStore((state) => state.reset);
  const navigate = useNavigationStore((state) => state.navigate);

  const importConfig = async (content: string) => {
    try {
      const config = ini.parse(content);
      const { success } = configSchema.safeParse(config);

      if (!success) {
        write(
          <ErrorMessage message="failed to import credentials: invalid .ini file" />
        );
        return;
      }

      showIndicator("Importing credentials...");

      const authenticated = await login(
        {
          host: config.default.hq,
          account: config.default.account,
          token: config.default.token,
          serverType: "prelude",
        },
        takeControl().signal
      );

      if (authenticated) {
        resetTerminal();
        resetEditor();
        navigate("welcome");
        write(
          <TerminalMessage
            message={`credentials imported successfully.`}
            helpText={`type "list-tests" to show all your tests`}
          />
        );

        focusTerminal();
      } else {
        write(
          <ErrorMessage message="failed to import credentials: unable to authenticate" />
        );
      }
    } catch (err) {
      if (isExitError(err)) {
        return write(<TerminalMessage message="exited" />);
      }

      write(<ErrorMessage message="failed to import credentials" />);
    } finally {
      hideIndicator();
    }
  };

  const handleExport = async () => {
    focusTerminal();
    if (!credentials) {
      write(
        <ErrorMessage message="failed to export credentials: no credentials found" />
      );
      return;
    }

    const config = ini.encode(
      {
        default: {
          hq: host,
          account: credentials?.account,
          token: credentials?.token,
        },
      },
      { whitespace: true }
    );

    if ("showSaveFilePicker" in window) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: "keychain.ini",
          types: [
            {
              description: "Configuration file",
              accept: { "text/plain": [".ini"] },
            },
          ],
        });
        const fileStream = await fileHandle.createWritable();
        await fileStream.write(new Blob([config], { type: "text/plain" }));
        await fileStream.close();

        write(
          <TerminalMessage message={`credentials exported successfully`} />
        );
      } catch (err) {
        notifyError("Failed to open file picker", err);
      }
      return;
    }

    /** For legacy browsers */
    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(
      new Blob([config], { type: "text/plain" })
    );
    a.download = "keychain.ini";
    a.click();

    write(<TerminalMessage message={`credentials exported successfully`} />);
  };

  const handleImport = async () => {
    focusTerminal();
    if ("showOpenFilePicker" in window) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [
            {
              description: "Configuration File",
              accept: {
                "text/plain": [".ini"],
              },
            },
          ],
          excludeAcceptAllOption: true,
          multiple: false,
        });

        const file: File = await handle.getFile();
        await importConfig(await file.text());
      } catch (err) {
        notifyError("Failed to open file picker", err);
      }
      return;
    }

    /** For legacy browsers */
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", ".ini");
    input.addEventListener("change", async (e) => {
      const file = (e.target as HTMLInputElement)?.files?.[0];

      if (!file) {
        return;
      }

      const content = await readAsText(file);
      await importConfig(content);
    });
    input.click();
  };

  return { handleExport, handleImport };
};

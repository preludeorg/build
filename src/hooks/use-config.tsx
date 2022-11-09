import { z } from "zod";
import {
  ErrorMessage,
  isExitError,
  TerminalMessage,
} from "../lib/commands/helpers";
import focusTerminal from "../utils/focus-terminal";
import useAuthStore from "./auth-store";
import useEditorStore from "./editor-store";
import useNavigationStore from "./navigation-store";
import useTerminalStore from "./terminal-store";
import ini from "ini";

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
  const login = useAuthStore((state) => state.login);
  const takeControl = useTerminalStore((state) => state.takeControl);
  const write = useTerminalStore((state) => state.write);
  const resetTerminal = useTerminalStore((state) => state.reset);
  const resetEditor = useEditorStore((state) => state.reset);
  const navigate = useNavigationStore((state) => state.navigate);
  const host = useAuthStore((state) => state.host);
  const credentials = useAuthStore((state) => state.credentials);

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
        // @ts-ignore;
        const fileHandle = await window.showSaveFilePicker({
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
      } catch (err) {}
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
        //@ts-ignore
        const [handle] = await window.showOpenFilePicker({
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
        importConfig(await file.text());
      } catch (err) {}
      return;
    }

    /** For legacy browsers */
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", ".ini");
    input.addEventListener("change", async (e: any) => {
      const file = e.target?.files?.[0];

      if (!file) {
        return;
      }

      const content = await readAsText(file);
      importConfig(content);
    });
    input.click();
  };

  return { handleExport, handleImport };
};

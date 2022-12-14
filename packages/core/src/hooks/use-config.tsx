import { notifyError, notifySuccess } from "@theprelude/ds";
import ini from "ini";
import { z } from "zod";
import shallow from "zustand/shallow";
import { purgeAccount } from "../lib/api";
import { emitter } from "../lib/emitter";
import { useAuthStore } from "../stores/auth-store";
import { select } from "../utils/select";

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
  const { login, host, credentials, isAnonymous } = useAuthStore(
    select("login", "host", "credentials", "isAnonymous"),
    shallow
  );

  const importConfig = async (content: string) => {
    try {
      const config = ini.parse(content);
      const { success } = configSchema.safeParse(config);

      if (!success) {
        notifyError("Failed to import credentials: invalid .ini file");
        return;
      }

      await login({
        host: config.default.hq,
        account: config.default.account,
        token: config.default.token,
        serverType: "prelude",
      });

      if (credentials && isAnonymous) {
        await purgeAccount({ host, credentials });
      }

      notifySuccess("Credentials imported successfully.");
      emitter.emit("import");
    } catch (err) {
      notifyError("Failed to import credentials: unable to authenticate");
    }
  };

  const handleExport = async () => {
    if (!credentials) {
      notifyError("Failed to export credentials: no credentials found");
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

        notifySuccess("Credentials exported successfully");
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

    notifySuccess("Credentials exported successfully");
  };

  const handleImport = async () => {
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

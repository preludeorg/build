import create from "zustand";
import { persist } from "zustand/middleware";
import { Credentials } from "@theprelude/sdk";
import { isExitError } from "../lib/commands/helpers";
import { getTestList, newAccount } from "../lib/api";

interface AuthStore {
  host: string;
  serverType: "prelude" | "custom";
  credentials?: Credentials;
  createAccount: (handle: string, signal: AbortSignal) => Promise<Credentials>;
  login: (
    record: {
      host: string;
      account: string;
      token: string;
      serverType: "prelude" | "custom";
    },
    signal: AbortSignal
  ) => Promise<boolean>;
  disconnect: () => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      host: "https://detect.dev.prelude.org",
      serverType: "prelude",
      async createAccount(handle, signal: AbortSignal) {
        const { host } = get();

        const credentials = await newAccount(handle, host, signal);
        set(() => ({ credentials }));
        return credentials;
      },
      async login({ host, account, token, serverType }, signal) {
        const credentials = { account, token };
        try {
          await getTestList({ host, credentials }, signal);
          set(() => ({ host, credentials, serverType }));
          return true;
        } catch (err) {
          if (isExitError(err)) {
            throw err;
          }
          return false;
        }
      },
      disconnect() {
        const host = "";
        const credentials = { account: "", token: "" };
        set(() => ({ host, credentials }));
      },
    }),
    {
      name: "prelude-credentials",
    }
  )
);

export default useAuthStore;

export const selectIsConnected = (state: AuthStore) => !!state.credentials;

export const authState = () => useAuthStore.getState();

import { Credentials } from "@theprelude/sdk";
import create from "zustand";
import { persist } from "zustand/middleware";
import { getTestList, newAccount } from "../lib/api";

interface AuthStore {
  host: string;
  serverType: "prelude" | "custom";
  credentials?: Credentials;
  seenTooltip: boolean;
  tooltipVisible: boolean;
  showTooltip: () => void;
  hideTooltip: () => void;
  createAccount: (handle: string, signal: AbortSignal) => Promise<Credentials>;
  login: (
    record: {
      host: string;
      account: string;
      token: string;
      serverType: "prelude" | "custom";
    },
    signal: AbortSignal
  ) => Promise<void>;
  disconnect: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      host: import.meta.env.VITE_PRELUDE_SERVICE_URL,
      serverType: "prelude",
      async createAccount(handle, signal: AbortSignal) {
        const { host } = get();

        const credentials = await newAccount(handle, host, signal);
        set(() => ({ credentials }));
        return credentials;
      },
      async login({ host, account, token, serverType }, signal) {
        const credentials = { account, token };
        await getTestList({ host, credentials }, signal);
        set(() => ({ host, credentials, serverType }));
      },
      disconnect() {
        const host = "";
        const credentials = { account: "", token: "" };
        set(() => ({ host, credentials }));
      },
      seenTooltip: false,
      tooltipVisible: false,
      showTooltip() {
        const { seenTooltip } = get();

        if (seenTooltip) {
          return;
        }

        set(() => ({ tooltipVisible: true, seenTooltip: true }));

        setTimeout(() => {
          set(() => ({ tooltipVisible: false }));
        }, 5000);
      },
      hideTooltip() {
        set(() => ({ tooltipVisible: false }));
      },
    }),
    {
      name: "prelude-credentials",
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !["tooltipVisible"].includes(key)
          )
        ),
    }
  )
);

export const selectIsConnected = (state: AuthStore) => !!state.credentials;

export const authState = () => useAuthStore.getState();

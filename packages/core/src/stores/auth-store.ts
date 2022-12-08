import { Credentials } from "@theprelude/sdk";
import create from "zustand";
import { persist } from "zustand/middleware";
import { getUsers, newAccount } from "../lib/api";
import { emitter } from "../main";

const generateHandle = () => {
  const number = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
  return `anonymous-user-${number}`;
};

interface AuthStore {
  host: string;
  serverType: "prelude" | "custom";
  credentials?: Credentials;
  handle?: string;
  isAnonymous?: boolean;
  seenTooltip: boolean;
  tooltipVisible: boolean;
  initializing?: boolean;
  initialize: () => Promise<void>;
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
    signal?: AbortSignal
  ) => Promise<void>;
  disconnect: () => void;
  changeHandle: (handle: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      host: import.meta.env.VITE_PRELUDE_SERVICE_URL,
      serverType: "prelude",
      isAnonymous: false,
      async createAccount(handle, signal: AbortSignal) {
        const { host } = get();
        const credentials = await newAccount(handle, host, signal);
        set(() => ({ credentials, handle }));
        return credentials;
      },
      async login({ host, account, token, serverType }, signal) {
        const credentials = { account, token };
        await getUsers({ host, credentials }, signal);
        set(() => ({ host, credentials, serverType }));
      },
      async initialize() {
        try {
          const { host, credentials, handle } = get();
          set(() => ({ initializing: true }));

          if (credentials && !handle) {
            /** TODO: Get handle for user */
            emitter.emit("auth-ready", { newAccount: false });
            return;
          }

          if (credentials) {
            /** Already logged in */
            emitter.emit("auth-ready", { newAccount: false });
            return;
          }

          const newHandle = generateHandle();
          /** Create new account for anonymous user */
          const newCredentials = await newAccount(newHandle, host);

          set(() => ({
            credentials: newCredentials,
            handle: newHandle,
            isAnonymous: true,
          }));
          emitter.emit("auth-ready", { newAccount: true });
        } catch (e) {
          emitter.emit("auth-error", { error: (e as Error).message });
        } finally {
          set(() => ({ initializing: false }));
        }
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
      changeHandle(handle) {
        set(() => ({ isAnonymous: false, handle }));
      },
    }),
    {
      name: "prelude-credentials",

      partialize: (state) => {
        if (state.isAnonymous) {
          return null;
        }

        return Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !["tooltipVisible"].includes(key)
          )
        );
      },
    }
  )
);

export const selectIsConnected = (state: AuthStore) => !!state.credentials;

export const authState = () => useAuthStore.getState();

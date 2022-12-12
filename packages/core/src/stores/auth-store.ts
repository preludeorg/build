import { Credentials, Permissions } from "@theprelude/sdk";
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
  dataLossWarning?: boolean;
  initialize: () => Promise<void>;
  changeHandle: (handle: string, token: string) => void;
  showTooltip: () => void;
  hideTooltip: () => void;
  setDataLossWarning: (warn: boolean) => void;
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
      async login({ host, account, token, serverType }) {
        const credentials = { account, token };
        const users = await getUsers({ host, credentials });
        const user =
          users.find((user) => user.permission === Permissions.ADMIN) ??
          users[0];

        set(() => ({
          host,
          credentials,
          serverType,
          handle: user.handle,
          isAnonymous: false,
        }));
      },
      async initialize() {
        try {
          const { host, credentials } = get();
          set(() => ({ initializing: true }));

          if (credentials) {
            const users = await getUsers({ host, credentials });
            const user =
              users.find((user) => user.permission === Permissions.ADMIN) ??
              users[0];

            set(() => ({
              handle: user.handle,
            }));
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
      setDataLossWarning(warn) {
        set(() => ({ dataLossWarning: warn }));
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
      changeHandle(handle, token) {
        set((state) => {
          if (!state.credentials) {
            throw new Error("expected credentials to be set");
          }

          return {
            isAnonymous: false,
            handle,
            credentials: { ...state.credentials, token },
          };
        });

        emitter.emit("handle-changed");
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
            ([key]) => !["tooltipVisible", "dataLossWarning"].includes(key)
          )
        );
      },
    }
  )
);

export const selectIsConnected = (state: AuthStore) => !!state.credentials;

export const authState = () => useAuthStore.getState();

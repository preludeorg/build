import create from "zustand";
import { persist } from "zustand/middleware";
import { Service, Credentials } from "@theprelude/sdk";

interface AuthStore {
  host: string;
  serverType: "prelude" | "custom";
  credentials?: Credentials;
  createAccount: (handle: string) => Promise<void>;
  login: (
    host: string,
    account: string,
    token: string,
    serverType: "prelude" | "custom"
  ) => Promise<boolean>;
  disconnect: () => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      host: "https://detect.dev.prelude.org",
      serverType: "prelude",
      async createAccount(handle) {
        const { host } = get();

        const service = new Service({ host });
        const credentials = await service.iam.newAccount(handle);

        set(() => ({ credentials }));
      },
      async login(host, account, token, serverType) {
        const credentials = { account, token };
        const service = new Service({ host, credentials });
        try {
          await service.build.listManifest();
          set(() => ({ host, credentials, serverType }));
          return true;
        } catch (err) {
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

export const selectServiceConfig = (state: AuthStore) => ({
  host: state.host,
  credentials: state.credentials,
});

export const selectIsConnected = (state: AuthStore) => !!state.credentials;

export const authState = () => useAuthStore.getState();

import create from "zustand";
import { Service, Credentials } from "@theprelude/sdk";

interface AuthStore {
  host: string;
  isConnected: boolean;
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

const useAuthStore = create<AuthStore>((set, get) => ({
  host: "https://detect.dev.prelude.org",
  serverType: "prelude",
  isConnected: false,
  async createAccount(handle) {
    const { host } = get();

    const service = new Service({ host });
    const credentials = await service.iam.newAccount(handle);

    set(() => ({ credentials, isConnected: true }));
  },
  async login(host, account, token, serverType) {
    const credentials = { account, token };
    const service = new Service({ host, credentials });
    try {
      await service.build.listManifest();
      set(() => ({ host, credentials, serverType, isConnected: true }));
      return true;
    } catch (err) {
      return false;
    }
  },
  disconnect() {
    const host = "";
    const credentials = { account: "", token: "" };
    set(() => ({ host, credentials, isConnected: false }));
  },
}));

export default useAuthStore;

export const authState = () => useAuthStore.getState();

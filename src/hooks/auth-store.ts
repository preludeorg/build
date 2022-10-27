import create from "zustand";
import { Service, Credentials } from "@prelude/sdk";

interface AuthStore {
  host: string;
  isConnected: boolean;
  serverType: "prelude" | "custom";
  credentials?: Credentials;
  createAccount: (email: string) => Promise<{ host: string }>;
}

const useAuthStore = create<AuthStore>((set, get) => ({
  host: "https://detect.dev.prelude.org",
  serverType: "prelude",
  isConnected: false,
  async createAccount(email) {
    const { host } = get();

    const service = new Service({ host });
    const credentials = await service.iam.newAccount(email);

    set(() => ({ credentials, isConnected: true }));

    return { host };
  },
}));

export default useAuthStore;

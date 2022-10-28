import create from "zustand";
import { Service, Credentials } from "@theprelude/sdk";

const TEMP_ACCOUNT = {
  token: "d4081fd9-4146-45f1-b283-ae5074857703",
  account: "6c771152889ca570ef915c3fc6f4aa1c",
};

interface AuthStore {
  host: string;
  isConnected: boolean;
  serverType: "prelude" | "custom";
  credentials?: Credentials;
  createAccount: (email: string) => Promise<void>;
}

const useAuthStore = create<AuthStore>((set, get) => ({
  host: "https://detect.dev.prelude.org",
  serverType: "prelude",
  isConnected: true,
  credentials: TEMP_ACCOUNT,
  async createAccount(email) {
    const { host } = get();

    const service = new Service({ host });
    const credentials = await service.iam.newAccount(email);

    set(() => ({ credentials, isConnected: true }));
  },
}));

export default useAuthStore;

export const authState = () => useAuthStore.getState();

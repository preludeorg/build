import { ServiceConfig, Test } from "@theprelude/sdk";
import create from "zustand";
import { getTestList, verifiedTests } from "../lib/api";
import { parseBuildVariant } from "../lib/utils/parse-variant";

interface TestsStore {
  loading: boolean;
  tests: Test[];
  builtVariants: string[];
  fetch: (config: ServiceConfig) => Promise<void>;
}

const useTestsStore = create<TestsStore>((set) => ({
  loading: false,
  tests: [],
  builtVariants: [],
  async fetch(config) {
    try {
      set(() => ({ loading: true }));
      const builtVariants = await verifiedTests(config);

      const testIds = new Set(
        builtVariants.map((t) => parseBuildVariant(t)?.id ?? "")
      );

      const allTests = await getTestList(config, new AbortController().signal);

      const tests = allTests.filter((test) => testIds.has(test.id));

      set(() => ({ tests, builtVariants }));
    } catch (err) {
    } finally {
      set(() => ({ loading: false }));
    }
  },
}));

export default useTestsStore;

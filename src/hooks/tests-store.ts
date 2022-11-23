import { ServiceConfig, Test } from "@theprelude/sdk";
import create from "zustand";
import { notifyError } from "../components/notifications/notifications";
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
      const tests = await getTestList(config, new AbortController().signal);

      set(() => ({ tests, builtVariants }));
    } catch (err) {
      notifyError("Failed to get verified tests", err);
    } finally {
      set(() => ({ loading: false }));
    }
  },
}));

export const selectVerifiedTest = (state: TestsStore) => {
  const testIds = new Set(
    state.builtVariants.map((t) => parseBuildVariant(t)?.id ?? "")
  );
  return state.tests
    .filter((test) => testIds.has(test.id))
    .map((test) => {
      return {
        id: test.id,
        question: test.question,
        variants: state.builtVariants.filter((v) => v.startsWith(test.id)),
      };
    });
};

export default useTestsStore;

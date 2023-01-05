import create from "zustand";

type Tests = "viewTest" | "deployTest" | "createTest" | "buildTest";

interface IntroStore {
  completedTests: Tests[];
  markCompleted: (name: Tests) => void;
}

const useIntroStore = create<IntroStore>((set) => ({
  completedTests: [],
  markCompleted: (name: Tests) => {
    set((state) => ({
      completedTests: Array.from(new Set([...state.completedTests, name])),
    }));
  },
}));

export default useIntroStore;

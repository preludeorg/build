import create from "zustand";

type Tests = "viewTest" | "deployTest" | "createTest" | "buildTest";

interface IntroStore {
  isExpandedFirstTest: boolean;
  isFormOpen: boolean;
  setIsFormOpen: (isOpen: boolean) => void;
  expandFirstTest: () => void;
  completedTests: Tests[];
  markCompleted: (name: Tests) => void;
}

const useIntroStore = create<IntroStore>((set) => ({
  isFormOpen: false,
  setIsFormOpen(isOpen) {
    set(() => ({
      isFormOpen: isOpen,
    }));
  },
  isExpandedFirstTest: false,
  expandFirstTest() {
    set(() => ({
      isExpandedFirstTest: true,
    }));
  },
  completedTests: [],
  markCompleted: (name: Tests) => {
    set((state) => ({
      completedTests: Array.from(new Set([...state.completedTests, name])),
    }));
  },
}));

export default useIntroStore;

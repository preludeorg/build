import { useMutation } from "@tanstack/react-query";
import {
  downloadTest,
  isPreludeTest,
  select,
  Test,
  useAuthStore,
} from "@theprelude/core";
import { notifyError, notifySuccess } from "@theprelude/ds";
import shallow from "zustand/shallow";
import useNavigationStore from "./navigation-store";
import { useTab } from "./use-tab";

export const useOpenTest = (test: Test) => {
  const { open } = useTab();
  const readonly = isPreludeTest(test);
  const hideOverlay = useNavigationStore((state) => state.hideOverlay);
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  return useMutation(
    (testCodeFile: string) => downloadTest(testCodeFile, serviceConfig),
    {
      onSuccess: async (code) => {
        open(test, code);
        hideOverlay();
        const saveMessage = readonly
          ? " in read-only mode"
          : ". all changes will auto-save";
        notifySuccess(`Opened test${saveMessage}`);
      },
      onError: (e) => {
        notifyError("Failed to open test code.", e);
      },
    }
  );
};

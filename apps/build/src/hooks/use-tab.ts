import { select, Test } from "@theprelude/core";
import shallow from "zustand/shallow";
import useEditorStore from "./editor-store";
import useNavigationStore from "./navigation-store";

export const useTab = () => {
  const { closeTab, openTab } = useEditorStore(
    select("openTab", "closeTab"),
    shallow
  );
  const navigate = useNavigationStore((state) => state.navigate);
  const close = (vstName: string) => {
    if (!closeTab(vstName)) {
      navigate("welcome");
    }
  };

  const open = (test: Test, code: string) => {
    navigate("editor");
    openTab(test, code);
  };

  return { close, open };
};

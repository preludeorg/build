import shallow from "zustand/shallow";
import { Variant } from "../lib/api";
import { select } from "../lib/utils/select";
import useEditorStore from "./editor-store";
import useNavigationStore from "./navigation-store";

export const useTab = () => {
  const { closeTab, openTab } = useEditorStore(
    select("openTab", "closeTab"),
    shallow
  );
  const navigate = useNavigationStore((state) => state.navigate);
  const close = (variant: string) => {
    if (!closeTab(variant)) {
      navigate("welcome");
    }
  };

  const open = (variant: Variant) => {
    navigate("editor");
    openTab(variant);
  };

  return { close, open };
};

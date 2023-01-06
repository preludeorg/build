import { useMutation, useQueryClient } from "@tanstack/react-query";
import { buildTest, select, useAuthStore } from "@theprelude/core";
import { Button, notifyError, PlayIcon } from "@theprelude/ds";
import shallow from "zustand/shallow";
import useEditorStore from "../../hooks/editor-store";
import useIntroStore from "../../hooks/intro-store";
import { getLanguage } from "../../lib/lang";
import { validate } from "../../lib/lang/linter";
import { driver } from "../driver/driver";
import Results from "../results/results";
import styles from "./control-panel.module.css";

const ControlPanel: React.FC = () => {
  const serviceConfig = useAuthStore(select("host", "credentials"), shallow);
  const { markCompleted } = useIntroStore(select("markCompleted"), shallow);
  const { validTest, readonly, currentTabId } = useEditorStore((state) => {
    const tab = state.tabs[state.currentTabId];
    return {
      validTest: validate(tab.buffer, getLanguage(tab.extension).linters),
      currentTabId: state.currentTabId,
      readonly: tab.readonly,
    };
  }, shallow);
  const queryClient = useQueryClient();
  const {
    mutate: build,
    isLoading,
    data: results,
  } = useMutation(() => buildTest(currentTabId, serviceConfig), {
    onSuccess: async ({}) => {
      void queryClient.invalidateQueries({
        queryKey: ["tests", serviceConfig],
      });
    },
    onError: (e) => {
      notifyError("Failed to build the test.", e);
    },
  });

  return (
    <>
      <div className={styles.controlPanel}>
        {!readonly && (
          <Button
            data-tooltip-id="build-test"
            onClick={() => {
              markCompleted("buildTest");
              driver.reset();
              build();
            }}
            intent={"success"}
            icon={<PlayIcon />}
            disabled={!validTest || isLoading}
            loading={isLoading}
          >
            Build
          </Button>
        )}
      </div>
      {results && <Results results={results} />}
    </>
  );
};

export default ControlPanel;

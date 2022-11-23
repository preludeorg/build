import { Resizable } from "re-resizable";
import { useEffect, useRef, useState } from "react";
import shallow from "zustand/shallow";
import useNavigationStore from "../hooks/navigation-store";
import { select } from "../lib/utils/select";
import styles from "./app.module.css";
import EditorPanel from "./editor/editor-panel";
import DragHandle from "./icons/drag-handle-icon";
import TestCatalog from "./manifest/test-catalog";
import { Notifications } from "./notifications/notifications";
import ReloadPrompt from "./reload-prompt/reload-prompt";
import Servers from "./servers/servers";
import StatusBar from "./status-bar/status-bar";
import Terminal from "./terminal/terminal";
import VerifiedTests from "./verified-tests/verified-tests";
import Welcome from "./welcome/welcome";

function App() {
  const [defaultHeight, setDefaultHeight] = useState<string | null>(null);
  const { panel, overlay } = useNavigationStore(
    select("panel", "overlay"),
    shallow
  );

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      setDefaultHeight("30vh");
      return;
    }

    const sectionHeight = ref.current.offsetHeight + 100;
    const spaceRemaining = window.innerHeight - sectionHeight;
    const percentage = (spaceRemaining / window.innerHeight) * 100;

    if (percentage < 30) {
      setDefaultHeight("30vh");
      return;
    }

    setDefaultHeight(percentage.toFixed(2) + "vh");
  }, [ref.current]);

  const handle = <DragHandle className={styles.dragHandle} />;

  return (
    <div className={styles.app}>
      <main>
        <section className={styles.topSection}>
          {panel === "welcome" && <Welcome ref={ref} />}
          {panel === "editor" && <EditorPanel />}
        </section>
        {defaultHeight && (
          <Resizable
            className={styles.footer}
            enable={{ top: true }}
            defaultSize={{ height: defaultHeight, width: "100%" }}
            maxHeight="80vh"
            minHeight="10vh"
            handleClasses={{ top: styles.handle }}
            handleComponent={{
              top: handle,
            }}
          >
            <Terminal />
          </Resizable>
        )}
        <StatusBar />
      </main>
      {overlay === "servers" && <Servers />}
      {overlay === "testCatalog" && <TestCatalog />}
      {overlay === "verifiedTests" && <VerifiedTests />}
      <ReloadPrompt />
      <Notifications />
    </div>
  );
}

export default App;

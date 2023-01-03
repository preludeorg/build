import { select } from "@theprelude/core";
import shallow from "zustand/shallow";
import useNavigationStore from "../hooks/navigation-store";
import { useDefaultHeight } from "../hooks/use-default-height";
import styles from "./app.module.css";
import EditorPanel from "./editor/editor-panel";
import Overlays from "./overlays/overlays";
import StatusBar from "./status-bar/status-bar";
import Welcome from "./welcome/welcome";

function Build() {
  const { panel, overlay } = useNavigationStore(
    select("panel", "overlay"),
    shallow
  );
  const { ref } = useDefaultHeight();

  return (
    <div className={styles.app}>
      <main>
        <section className={styles.topSection}>
          {panel === "welcome" && <Welcome ref={ref} />}
          {panel === "editor" && <EditorPanel />}
        </section>
        <StatusBar />
      </main>
      <Overlays overlay={overlay} />
    </div>
  );
}

export default Build;

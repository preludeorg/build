import { select } from "@theprelude/core";
import "driver.js/dist/driver.min.css";
import Helmet from "react-helmet";
import shallow from "zustand/shallow";
import useNavigationStore from "../hooks/navigation-store";
import { useDefaultHeight } from "../hooks/use-default-height";
import styles from "./app.module.css";
import Browser from "./browser/browser";
import EditorPanel from "./editor/editor-panel";
import Overlays from "./overlays/overlays";
import Welcome from "./welcome/welcome";

function Build() {
  const { panel, overlay } = useNavigationStore(
    select("panel", "overlay"),
    shallow
  );
  const { ref } = useDefaultHeight();

  return (
    <div className={styles.app}>
      <Helmet>
        <title>Prelude | Build</title>
        <style>
          {"body {  background-color: var(--color-secondary-40); }"}
        </style>
      </Helmet>

      <main>
        <section className={styles.topSection}>
          {panel === "welcome" && <Welcome ref={ref} />}
          {panel === "editor" && <EditorPanel />}
        </section>
      </main>
      <Browser />
      <Overlays overlay={overlay} />
    </div>
  );
}

export default Build;

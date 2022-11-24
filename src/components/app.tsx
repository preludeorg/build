import shallow from "zustand/shallow";
import useNavigationStore from "../hooks/navigation-store";
import { useDefaultHeight } from "../hooks/use-default-height";
import { select } from "../lib/utils/select";
import styles from "./app.module.css";
import EditorPanel from "./editor/editor-panel";
import Footer from "./footer";
import { Notifications } from "./notifications/notifications";
import Overlays from "./overlays/overlays";
import ReloadPrompt from "./reload-prompt/reload-prompt";
import StatusBar from "./status-bar/status-bar";
import Welcome from "./welcome/welcome";

function App() {
  const { panel, overlay } = useNavigationStore(
    select("panel", "overlay"),
    shallow
  );
  const { ref, defaultHeight } = useDefaultHeight();

  return (
    <div className={styles.app}>
      <main>
        <section className={styles.topSection}>
          {panel === "welcome" && <Welcome ref={ref} />}
          {panel === "editor" && <EditorPanel />}
        </section>
        <Footer defaultHeight={defaultHeight} />
        <StatusBar />
      </main>
      <Overlays overlay={overlay} />
      <ReloadPrompt />
      <Notifications />
    </div>
  );
}

export default App;

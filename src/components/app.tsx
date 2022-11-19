import { Resizable } from "re-resizable";
import shallow from "zustand/shallow";
import useNavigationStore from "../hooks/navigation-store";
import { select } from "../lib/utils/select";
import styles from "./app.module.css";
import EditorPanel from "./editor/editor-panel";
import ReloadPrompt from "./reload-prompt/reload-prompt";
import Servers from "./servers/servers";
import StatusBar from "./status-bar/status-bar";
import Terminal from "./terminal/terminal";
import VerifiedTests from "./verified-tests/verified-tests";
import Welcome from "./welcome/welcome";

function App() {
  const { panel, overlay } = useNavigationStore(
    select("panel", "overlay"),
    shallow
  );
  return (
    <div className={styles.app}>
      <main>
        <section className={styles.topSection}>
          {panel === "welcome" && <Welcome />}
          {panel === "editor" && <EditorPanel />}
        </section>
        <Resizable
          className={styles.footer}
          enable={{ top: true }}
          defaultSize={{ height: "30vh", width: "100%" }}
          maxHeight="80vh"
          minHeight="10vh"
          handleClasses={{ top: styles.handle }}
        >
          <Terminal />
        </Resizable>
        <StatusBar />
      </main>
      {overlay === "servers" && <Servers />}
      {overlay === "verifiedTests" && <VerifiedTests />}
      <ReloadPrompt />
    </div>
  );
}

export default App;

import styles from "./app.module.css";
import Terminal from "./terminal/terminal";
import Welcome from "./welcome/welcome";
import EditorPanel from "./editor/editor-panel";
import useNavigationStore from "../hooks/navigation-store";
import Servers from "./servers/servers";
import shallow from "zustand/shallow";
import StatusBar from "./status-bar/status-bar";
import ReloadPrompt from "./reload-prompt/reload-prompt";

function App() {
  const { panel, serverPanelVisible, toggleServerPanel } = useNavigationStore(
    (state) => state,
    shallow
  );
  return (
    <div className={styles.app}>
      <main>
        <section className={styles.topSection}>
          {panel === "welcome" && <Welcome />}
          {panel === "editor" && <EditorPanel />}
        </section>
        <footer>
          <Terminal />
          <StatusBar />
        </footer>
      </main>
      {serverPanelVisible && <Servers toggleServerPanel={toggleServerPanel} />}
      <ReloadPrompt />
    </div>
  );
}

export default App;

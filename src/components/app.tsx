import styles from "./app.module.css";
import Terminal from "./terminal/terminal";
import Welcome from "./welcome/welcome";
import EditorPanel from "./editor/editor-panel";
import useNavigationStore from "../hooks/navigation-store";
import Servers from "./servers/servers";
import shallow from "zustand/shallow";

function App() {
  const { panel, serverPanelVisible, toggleServerPanel } = useNavigationStore(
    (state) => state,
    shallow
  );
  return (
    <div className={styles.app}>
      <main>
        <section>
          {panel === "welcome" && <Welcome />}
          {panel === "editor" && <EditorPanel />}
        </section>
        <footer>
          <Terminal />
        </footer>
      </main>
      {serverPanelVisible && <Servers toggleServerPanel={toggleServerPanel} />}
    </div>
  );
}

export default App;

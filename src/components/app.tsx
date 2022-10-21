import Swift from "../lib/lang/swift";
import styles from "./app.module.css";
import Terminal from "./terminal/terminal";
import Navbar from "./navbar/navbar";
import Welcome from "./welcome/welcome";
import useEditorStore from "../hooks/editor-store";
import EditorPanel from "./editor/editor-panel";
import useNavigationStore from "../hooks/navigation-store";

function App() {
  const panel = useNavigationStore((state) => state.panel);
  const navigate = useNavigationStore((state) => state.navigate);
  const toggleServerPanel = useNavigationStore(
    (state) => state.toggleServerPanel
  );

  const openTab = useEditorStore((state) => state.openTab);
  return (
    <div className={styles.app}>
      <Navbar
        navigation={panel}
        setNavigation={navigate}
        toggleServerPanel={toggleServerPanel}
      />
      <main>
        <section>
          {panel === "welcome" && <Welcome />}
          {panel === "editor" && <EditorPanel />}
        </section>
        <footer>
          <Terminal
            commands={{
              "list-manifest": () => {
                return `command not implemented`;
              },
              search: () => {
                return `command not implemented`;
              },
              open: () => {
                navigate("editor");
                const filename = `linux-${Date.now()}-x84.swift`;
                openTab({
                  name: filename,
                  code: new Swift().bootstrap(),
                });

                return `opened ${filename} in editor`;
              },
            }}
          />
        </footer>
      </main>
    </div>
  );
}

export default App;

import { useEditor } from "../hooks/editor";
import { useState } from "react";
import Swift from "../lib/lang/swift";
import styles from "./app.module.css";
import EditorWindow from "./editor/window";
import Terminal from "./terminal/terminal";
import Navbar from "./navbar/navbar";
import Welcome from "./welcome/welcome";
import EditorIntro from "./editor/editor-intro";

function App() {
  const editor = useEditor();
  const [navigation, setNavigation] = useState("welcome");
  const [showServerPanel, setShowServerPanel] = useState(false);
  const toggleServerPanel = () => {
    setShowServerPanel(!showServerPanel);
  };
  return (
    <div className={styles.app}>
      <Navbar
        navigation={navigation}
        setNavigation={setNavigation}
        toggleServerPanel={toggleServerPanel}
      />
      <main>
        <section>
          {navigation === "welcome" && <Welcome />}
          {navigation === "editor" &&
            (editor.hasTabs ? (
              <EditorWindow
                tabs={editor.tabs}
                buffer={editor.buffer}
                currentTab={editor.currentTab}
                closeTab={editor.closeTab}
                switchTab={editor.switchTab}
                updateBuffer={editor.updateCurrentBuffer}
                setNavigation={setNavigation}
              />
            ) : (
              <EditorIntro />
            ))}
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
                setNavigation("editor");
                const filename = `linux-${Date.now()}-x84.swift`;
                editor.openTab({
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

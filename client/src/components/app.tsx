import { useEditor } from "../hooks/editor";
import { useState } from "react";
import Swift from "../lib/lang/swift";
import styles from "./app.module.css";
import EditorWindow from "./editor/window";
import Navbar from "./navbar/navbar";
import Welcome from "./welcome/welcome";
import EditorIntro from "./editor/editorIntro";

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
      <main className={styles.main}>
        {navigation === "welcome" && <Welcome />}
        {!editor.hasTabs && navigation === "editor" && <EditorIntro />}
        {editor.hasTabs && (
          <EditorWindow
            tabs={editor.tabs}
            buffer={editor.buffer}
            currentTab={editor.currentTab}
            closeTab={editor.closeTab}
            switchTab={editor.switchTab}
            updateBuffer={editor.updateCurrentBuffer}
          />
        )}
      </main>
    </div>
  );
}

export default App;

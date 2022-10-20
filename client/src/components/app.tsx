import { useEditor } from "../hooks/editor";
import Swift from "../lib/lang/swift";
import styles from "./app.module.css";
import EditorWindow from "./editor/window";
import Terminal from "./terminal/terminal";
import Welcome from "./welcome/welcome";

function App() {
  const editor = useEditor();
  return (
    <div className={styles.app}>
      <main>
        {!editor.hasTabs && <Welcome />}
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
        <Terminal
          openTab={() => {
            editor.openTab({
              name: `linux-${Date.now()}-x84.swift`,
              code: new Swift().bootstrap(),
            });
          }}
        />
      </main>
    </div>
  );
}

export default App;

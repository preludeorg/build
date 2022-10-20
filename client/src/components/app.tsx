import { useEditor } from "../hooks/editor";
import Swift from "../lib/lang/swift";
import styles from "./app.module.css";
import EditorWindow from "./editor/window";

function App() {
  const editor = useEditor();
  return (
    <div className={styles.app}>
      <button
        onClick={() => {
          editor.openTab({
            name: `linux-x86-${Date.now()}.swift`,
            code: new Swift().bootstrap(),
          });
        }}
      >
        Add Tab
      </button>
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
    </div>
  );
}

export default App;

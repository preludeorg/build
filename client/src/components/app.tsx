import styles from "./app.module.css";
import EditorWindow from "./editor/window";

function App() {
  return (
    <div className={styles.app}>
      <EditorWindow />
    </div>
  );
}

export default App;

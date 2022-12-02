import useEditorStore, { selectHasTabs } from "../../hooks/editor-store";
import EditorIntro from "./editor-intro";
import EditorWindow from "./window";

const EditorPanel: React.FC = () => {
  const hasTabs = useEditorStore(selectHasTabs);

  return hasTabs ? <EditorWindow /> : <EditorIntro />;
};

export default EditorPanel;

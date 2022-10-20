import { useRef, useEffect } from "react";
import { EditorView } from "@codemirror/view";
import styles from "./editor.module.pcss";
import { indentWithTab } from "@codemirror/commands";
import { Compartment, EditorState, Extension } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";

const theme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "var(--text-sm)",
    fontFamily: "var(--font-code)",
  },
  ".cm-scroller": { overflow: "auto" },
  ".cm-content": {
    padding: "0 0 4px",
  },
  ".cm-gutters": { backgroundColor: "var(--color-secondary-20) !important" },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--color-secondary-20) !important",
  },
  ".cm-gutterElement": { marginTop: "0px" },
});

const defaultExtensions = [
  basicSetup,
  keymap.of([indentWithTab]),
  oneDark,
  new Compartment().of(EditorState.tabSize.of(2)),
  theme,
];

const Editor: React.FC<{
  extensions: Extension[];
  buffer: string;
  onChange: (newBuffer: string) => void;
}> = ({ extensions, buffer, onChange }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (editorRef.current === null) return;
    viewRef.current = new EditorView({
      parent: editorRef.current,
    });

    return () => {
      viewRef.current?.destroy();
    };
  }, [editorRef.current]);

  useEffect(() => {
    viewRef.current?.setState(
      EditorState.create({
        doc: buffer,
        extensions: [
          ...defaultExtensions,
          ...extensions,
          EditorView.updateListener.of((view) => {
            onChange(view.state.doc.toString());
          }),
        ],
      })
    );
  }, [viewRef.current, buffer, extensions]);

  return <div className={styles.editor} ref={editorRef} />;
};

export default Editor;

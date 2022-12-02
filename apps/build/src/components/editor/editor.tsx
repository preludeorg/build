import { indentWithTab } from "@codemirror/commands";
import { Compartment, EditorState, Extension } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { useEffect, useRef } from "react";
import styles from "./editor.module.pcss";

const theme = EditorView.theme({
  "&.cm-editor": {
    top: "0",
    bottom: "0",
    left: "0",
    right: "0",
    height: "100%",
    position: "absolute !important",
    fontSize: "var(--text-sm)",
  },
  ".cm-scroller": { overflow: "auto" },
  "&.cm-focused": { outline: "none !important" },
  ".cm-content": {
    padding: "0 0 4px",
    fontFamily: "var(--font-code)",
    lineHeight: "20px",
  },
  ".cm-gutters": {
    backgroundColor: "var(--color-secondary-20) !important",
    fontFamily: "var(--font-code)",
    lineHeight: "20px",
  },
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

  useEffect(() => {
    if (editorRef.current === null) return;
    const view = new EditorView({
      state: EditorState.create({
        doc: buffer,
        extensions: [
          ...defaultExtensions,
          ...extensions,
          EditorView.updateListener.of((view) => {
            if (view.docChanged) {
              onChange(view.state.doc.toString());
            }
          }),
        ],
      }),
      parent: editorRef.current,
    });

    view.focus();

    return () => {
      view.destroy();
    };
  }, [editorRef.current, buffer, extensions]);

  return <div className={styles.editor} ref={editorRef} />;
};

export default Editor;

import { EditorView } from "@codemirror/view";

function createPreludeLangChecks(testRegex: RegExp, cleanRegex: RegExp) {
  return EditorView.updateListener.of((vu) => {
    if (vu.docChanged) {
      const errors = [];
      const doc = vu.state.doc.toString();
      if (!doc.match(testRegex)) {
        errors.push("Required test method missing");
      }
      if (!doc.match(cleanRegex)) {
        errors.push("Required clean method missing");
      }

      if (errors.length === 0) {
        // TODO: do something
      }
    }
  });
}

export { createPreludeLangChecks };

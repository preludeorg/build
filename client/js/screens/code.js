import Api from "/client/js/api.js";
import Templates from "/client/js/dom/templates.js";
import C from "/client/js/screens/lang/c.js";
import CS from "/client/js/screens/lang/cs.js";
import Swift from "/client/js/screens/lang/swift.js";
import { basicSetup } from "codemirror"
import { EditorView, keymap } from "@codemirror/view"
import { EditorState, Compartment } from "@codemirror/state"
import { indentWithTab } from "@codemirror/commands"
import { oneDark } from "@codemirror/theme-one-dark"
import { hideElements, htmlToElement, showElements } from "../dom/helpers";

class Code {
    constructor() {
        this.name = null;
        this.editor = new EditorView({ parent: document.querySelector('#dcf-content') });
    }
    resetEditor(data, height) {
        const ext = data.name.split('.').pop();
        this.editor.setState(EditorState.create({
            doc: data.code,
            parent: document.querySelector('#dcf-content'),
            extensions: [
                basicSetup,
                keymap.of([indentWithTab]),
                oneDark,
                new Compartment().of(EditorState.tabSize.of(2)),
                ...this.language(ext).mode(this.name),
                EditorView.theme({
                    "&": { height: height, fontSize: "13px" },
                    ".cm-scroller": { overflow: "auto" },
                    ".cm-content": { backgroundColor: "#272B33 !important", padding: "0 0 4px" },
                    ".cm-gutters": { backgroundColor: "#323844 !important" },
                    ".cm-activeLineGutter": { backgroundColor: "#323844 !important" },
                    ".cm-gutterElement": { marginTop: "0px" }
                })
            ]
        }));
    }
    resize(data) {
        const tabRowHeight = document.querySelector('.tab-row').getBoundingClientRect().height;
        const newPanelTopHeight = document.querySelector('body').getBoundingClientRect().height - document.querySelector('.panel-bottom').getBoundingClientRect().height - tabRowHeight;
        document.querySelector('.panel-top').style.height = `${newPanelTopHeight + tabRowHeight}px`
        this.resetEditor(data, `${newPanelTopHeight}px`);
    }

    write(data) {
        this.name = data.name;
        Templates.tab(data.name).write();
        const panelTop = document.querySelector('.panel-top');
        const tabRowHeight = document.querySelector('.tab-row').getBoundingClientRect().height;
        panelTop.style.height = '75vh'
        const newPanelTopHeight = `${panelTop.getBoundingClientRect().height + tabRowHeight}px`;
        panelTop.style.height = newPanelTopHeight;
        this.resetEditor(data, "75vh");
    }
    language(ext) {
        if (ext === 'cs') {
            return new CS();
        } else if (ext === 'swift') {
            return new Swift();
        } else {
            return new C();
        }
    }
    test() {
        showElements('#spinner')
        const resultsElem = document.querySelector('#dcf-results')
        resultsElem.replaceChildren()
        resultsElem.append(
            htmlToElement(`<pre class="result-system">.......... [${new Date().toLocaleTimeString()}] Compiling test\n\n</pre>`)
        )

        Api.dcf.submit(this.name).then(res => res.json()).then(links => {
            links.forEach(link => {
                const status = link.status ? 'failed' : 'completed';
                const cpu = link['cpu'].toFixed(3);
                resultsElem.append(
                    htmlToElement(`<pre class="result-system result-${link.status}">\n.......... [${new Date().toLocaleTimeString()}] ${status} (${cpu}s CPU used)</pre>`)
                )
            });
        }).catch(err => {
            resultsElem.textContent = err;
        }).finally(() => {
            resultsElem.append(
                htmlToElement(`<pre class="result-system">.......... [${new Date().toLocaleTimeString()}] Complete</pre>`)
            )
            hideElements("#spinner")
        });
    }
}

export default Code;

import Api from "/client/js/api.js";
import Templates from "/client/js/dom/templates.js";
import C from "/client/js/screens/lang/c.js";
import Python from "/client/js/screens/lang/py.js";
import {basicSetup} from "codemirror"
import {EditorView, keymap} from "@codemirror/view"
import {EditorState, Compartment} from "@codemirror/state"
import {indentWithTab} from "@codemirror/commands"
import {oneDark} from "@codemirror/theme-one-dark"

class Code {
    constructor() {
        this.name = null;
        this.errors = [];
        this.editor = new EditorView({parent: $('#screen-code')[0]});
    }
    write(data) {
        $('.panel-top').css('height', '75vh');
        this.name = data.name;
        Templates.tab(data.name).write();

        this.editor.setState(EditorState.create({
            doc: data.code,
            parent: $('#screen-code')[0],
            extensions: [
                basicSetup,
                keymap.of([indentWithTab]),
                oneDark,
                new Compartment().of(EditorState.tabSize.of(2)),
                EditorView.updateListener.of(vu => {
                    if(vu.docChanged) {
                        Api.dcf.save(this.name, vu.state.doc.toString());
                    }
                }),
                ...this.language(data.name.split('.').pop()).mode(this.errors),
                EditorView.theme({
                    "&": {height: "75vh", fontSize: "13px"},
                    ".cm-scroller": {overflow: "auto"},
                })
            ]
        }));
    }
    language(ext) {
        if (ext === 'c') {
            return new C();
        } else if (ext === 'py') {
            return new Python();
        }
    }
    test() {
        $('#spinner').show();
        $('#dcf-results').empty()
            .append($('<pre>')
                .text(`.......... [${new Date().toLocaleTimeString()}] Compiling attack\n\n`)
                .addClass('result-system'));

        Api.dcf.submit(this.name).then(res => res.json()).then(links => {
            links.forEach(link => {
                const status = link.status ? 'failed' : 'completed';
                const cpu = link['cpu'].toFixed(3);
                $('#dcf-results').append($('<pre>')
                    .text(`\n.......... [${new Date().toLocaleTimeString()}] ${status} (${cpu}s CPU used)`)
                    .addClass(`result-${link.status}`)
                    .addClass('result-system'));
            });
        }).catch(err => {
            $('#dcf-results').text(err);
        }).finally(() => {
            $('#dcf-results')
                .append($('<pre>')
                .text(`.......... [${new Date().toLocaleTimeString()}] Complete`)
                .addClass('result-system'));
            $('#spinner').hide();
        });
    }
}

export default Code;
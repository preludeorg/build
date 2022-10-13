import Api from "/client/js/api.js";
import Templates from "/client/js/dom/templates.js";
import C from "/client/js/screens/lang/c.js";
import CS from "/client/js/screens/lang/cs.js";
import Swift from "/client/js/screens/lang/swift.js";
import {basicSetup} from "codemirror"
import {EditorView, keymap} from "@codemirror/view"
import {EditorState, Compartment} from "@codemirror/state"
import {indentWithTab} from "@codemirror/commands"
import {oneDark} from "@codemirror/theme-one-dark"

class Code {
    constructor() {
        this.name = null;
        this.editor = new EditorView({parent: $('#dcf-content')[0]});
    }
    resetEditor(data, height) {
        const ext = data.name.split('.').pop();
        this.editor.setState(EditorState.create({
            doc: data.code,
            parent: $('#dcf-content')[0],
            extensions: [
                basicSetup,
                keymap.of([indentWithTab]),
                oneDark,
                new Compartment().of(EditorState.tabSize.of(2)),
                ...this.language(ext).mode(this.name),
                EditorView.theme({
                    "&": {height: height, fontSize: "13px"},
                    ".cm-scroller": {overflow: "auto"},
                    ".cm-content": {backgroundColor: "#272B33 !important", padding: "0 0 4px"},
                    ".cm-gutters": {backgroundColor: "#323844 !important"},
                    ".cm-activeLineGutter": {backgroundColor: "#323844 !important"},
                    ".cm-gutterElement": {marginTop: "0px"}
                })
            ]
        }));
    }
    resize(data) {
        const tabRowHeight = $('.tab-row').height();
        const newPanelTopHeight = $('body').height() - $('.panel-bottom').height() - tabRowHeight;
        $('.panel-top').css('height', `${newPanelTopHeight + tabRowHeight}px`)
        this.resetEditor(data, `${newPanelTopHeight}px`);
    }
    write(data) {
        this.name = data.name;
        Templates.tab(data.name).write();
        const panelTop = $('.panel-top');
        const newPanelTopHeight = `${panelTop.css('height', '75vh').height() + $('.tab-row').height()}px`;
        panelTop.css('height', newPanelTopHeight);
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
        $('#spinner').show();
        $('#dcf-results').empty()
            .append($('<pre>')
                .text(`.......... [${new Date().toLocaleTimeString()}] Compiling test\n\n`)
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
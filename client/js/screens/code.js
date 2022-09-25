import CodeMirror from "/client/js/lib/codemirror5/src/codemirror.js";
import Api from "/client/js/api.js";
import C from "/client/js/screens/lang/c.js";

class Code {
    constructor() {
        this.name = null;
        this.editor = null;
        this.setUpEditor();
    }
    write(data) {
        $('.panel-top').css('height', '75%');
        this.name = data.name;
        this.editor.setValue(data.code);
        this.editor.setOption('mode', this.mode().language());
    }
    setUpEditor() {
        this.editor = CodeMirror.fromTextArea($('#dcf-contents')[0], {
            lineNumbers: true,
            autoRefresh: true,
            tabMode: 'indent',
            theme: 'darcula',
            mode: new C().language(),
            indentWithTabs: false,
            smartIndent: true,
            tabSize: 2
        });
        this.editor.setSize('100%', '100%');
        this.editor.on('keyup', (editor, ev) => {
            if (ev.keyCode !== 27) {
                try {
                    Api.dcf.save(this.name, editor.doc.getValue()).then(() => { });
                } catch(ex){
                    console.error(`Error saving code file: ${ex}`);
                }
            }
        });
    }
    mode() {
        return new C();
    }
    test() {
        $('#spinner').show();
        $('#dcf-results').empty()
            .append($('<pre>')
                .text(`.......... [${new Date().toLocaleTimeString()}] Compiling attack\n\n`)
                .addClass('result-system'));

        Api.dcf.submit(this.name, this.editor.doc.getValue()).then(link => {
            (link.output || link.error).split('\n').forEach(line => {
                $('#dcf-results').append($('<pre>').text(line));
            });
            $('#dcf-results').append($('<pre>')
                .text(`\n.......... [${new Date().toLocaleTimeString()}] ${link.status ? 'failed' : 'completed'} (${link.cpu.toFixed(3)}s CPU used)`)
                .addClass(`result-${link.status}`).addClass('result-system'));
            $('#spinner').hide();
        }).catch(err => {
            $('#dcf-result').text(err);
        });
    }
}

export default Code;
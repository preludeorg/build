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
        Api.dcf.submit(this.name).then(() => {
            const action = $('<button>').text('Click to refresh results');
            action.on('click', (ev) => {
                ev.stopPropagation();
                ev.preventDefault();

                Api.dcf.history(this.name).then(links => {
                    links.forEach(link => {
                       console.log(link);
                    });
                });
            });
            $('#dcf-results').append(action);
        }).catch(err => {
            $('#dcf-result').text(err);
        }).finally(() => {
            $('#spinner').hide();
        });
    }
}

export default Code;
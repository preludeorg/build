import Api from "/client/js/api.js";
import C from "/client/js/screens/lang/c.js";
import Python from "/client/js/screens/lang/py.js";

class Code {
    constructor() {
        this.name = null;
        this.editor = null;
        this.setUpEditor();
    }
    write(data) {
        $('.panel-top').css('height', '75%');
        const ext = data.name.split('.').pop();
        this.name = data.name;
        this.editor.setValue(data.code);
        this.editor.setOption('mode', this.language(ext).mode());
    }
    setUpEditor() {
        this.editor = CodeMirror.fromTextArea($('#dcf-contents')[0], {
            lineNumbers: true,
            autoRefresh: true,
            tabMode: 'indent',
            theme: 'darcula',
            mode: new C().mode(),
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
    language(ext) {
        if (ext === 'c') {
            return new C();
        } else if (ext === 'py') {
            return new Python();
        }
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
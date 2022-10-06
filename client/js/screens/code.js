import Api from "api.js";
import C from "screens/lang/c.js";
import Python from "screens/lang/py.js";

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
        $('#dcf-name').text(this.name.substring(
            this.name.indexOf("_") + 1, 
        ));
        $('#dcf-platform').attr("src",`/static/assets/logos/${this.name.substring(
            this.name.indexOf("_") + 1, 
            this.name.lastIndexOf("-")
        )}.svg`);
    }
    setUpEditor() {
        this.editor = CodeMirror.fromTextArea($('#dcf-contents')[0], {
            lineNumbers: true,
            autoRefresh: true,
            tabMode: 'indent',
            theme: 'material-darker',
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
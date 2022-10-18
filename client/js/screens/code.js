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
        const totalCPU = [];
        const fakeDatas = {
            fakeDataOne : {
                name: 'Can we catch a thief?',
                status: 1,
                cpu: '0.005',
                output: 'this is the output',
                created: 'time of creation',
                containerName: 'Container PR-12'
            },
            fakeDataTwo : {
                name: 'Can we catch a thief?',
                status: 0,
                cpu: '0.100',
                output: 'this is the output 2',
                created: 'time of creation 2',
                containerName: 'Container PR-9'
            }
        };

        $('#spinner').show();
        $('#dcf-results').empty()
            .append($('<pre>')
                .text(`.......... [${new Date().toLocaleTimeString()}] Compiling test\n\n`));

        Api.dcf.submit(this.name).then(res => Object.values(fakeDatas)).then(links => {
            $('.deploy-button > img').attr("src", `/static/assets/loader.svg`).toggleClass('deploy-image');
            $('#dcf-results').empty()
                .append($('<pre>')
                    .text(`Compiling "${links[0].name}" - ${this.name.split('_')[1]}...`));
            links.forEach(link => {
                const container = $($('#test-container-template').html());
                container.find('.test-output').text(link.output);
                container.find('.test-container-name > span').text(link.containerName);
                container.find('.test-cpu').text(`${link.cpu}s`);

                const status = link.status ? 'Completed' : 'Failed';
                container.find('.test-results').find('.test-status').addClass(`result-${link.status}`);
                container.find('.test-results > span').text(status);
                container.find('.test-results-button').on('click', (ev) => {
                    container.find('.test-results-button > .dropdown-arrow').toggleClass('dropdown-arrow-active');
                    container.find('.test-output').toggle();                
                });
                $('#dcf-results').append(container);
                totalCPU.push(link.cpu);
            });
        }).catch(err => {
            $('#dcf-results').text(err);
        }).finally(() => {
            $('#dcf-results')
                .append($('<pre>')
                    .text(`Completed in ${totalCPU.reduce((acc, a) => (acc + a), 0)}`)
                    .addClass('test-completion'));
            $('#spinner').hide();
            $('.deploy-button > img').attr("src", `/static/assets/play.svg`).toggleClass('deploy-image');
        });
    }
}

export default Code;
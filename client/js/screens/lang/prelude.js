import {EditorView} from "@codemirror/view";
import Api from "/client/js/api";

function displayLangErrors(errors) {
    const dcfResults = $('#dcf-results');
    dcfResults.empty();
    errors.forEach(err => dcfResults.append($('<pre class="result-1">').text(err)));
    $("#deploy-dcf").parent().css('pointer-events', errors.length === 0 ? '' : 'none');
}

function createPreludeLangChecks(testRegex, cleanupRegex, name) {
    return EditorView.updateListener.of(vu => {
        if (vu.docChanged) {
            const errors = [];
            const doc = vu.state.doc.toString();
            if (!doc.match(testRegex)) {
                errors.push('Required test method missing');
            }
            if (!doc.match(cleanupRegex)) {
                errors.push('Required cleanup method missing');
            }
            displayLangErrors(errors);
            if(errors.length === 0) {
                Api.dcf.save(name, vu.state.doc.toString());
            }
        }
    })
}

export {displayLangErrors, createPreludeLangChecks};
import {EditorView} from "@codemirror/view";

function displayLangErrors(errors) {
    const dcfResults = $('#dcf-results');
    dcfResults.empty();
    errors.forEach(err => dcfResults.append($('<pre class="result-1">').text(err)));
    $("#deploy-dcf").parent().css('pointer-events', errors.length === 0 ? '' : 'none');
}

function createPreludeLangChecks(attackRegex, cleanupRegex, langErrors) {
     return EditorView.updateListener.of(vu => {
         if(vu.docChanged) {
             const errors = [];
             const doc = vu.state.doc.toString();
             if (!doc.match(attackRegex)) {
                 errors.push('Required attack method missing');
             }
             if (!doc.match(cleanupRegex)) {
                 errors.push('Required cleanup method missing');
             }
             langErrors = errors;
             displayLangErrors(errors);
         }
     })
}

export {displayLangErrors, createPreludeLangChecks};
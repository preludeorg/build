import { EditorView } from "@codemirror/view";
import Api from "/client/js/api";
import { htmlToElement } from '../../dom/helpers'

function displayLangErrors(errors) {
    const dcfResults = document.querySelector('#dcf-results');
    dcfResults.replaceChildren();
    errors.forEach(err => dcfResults.append(htmlToElement(`<pre class="result-1">${err.toString()}</pre>`)));
    document.querySelector('#deploy-dcf').parentNode.style.pointerEvents = errors.length === 0 ? '' : 'none'
}

function createPreludeLangChecks(testRegex, cleanRegex, name) {
    return EditorView.updateListener.of(vu => {
        if (vu.docChanged) {
            const errors = [];
            const doc = vu.state.doc.toString();
            if (!doc.match(testRegex)) {
                errors.push('Required test method missing');
            }
            if (!doc.match(cleanRegex)) {
                errors.push('Required clean method missing');
            }
            displayLangErrors(errors);
            if (errors.length === 0) {
                Api.dcf.save(name, vu.state.doc.toString());
            }
        }
    })
}

export { displayLangErrors, createPreludeLangChecks };

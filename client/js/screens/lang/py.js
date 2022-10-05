import {python} from "@codemirror/legacy-modes/mode/python"
import {StreamLanguage} from "@codemirror/language";
import {EditorView} from "@codemirror/view";
import {displayLangErrors} from "./prelude";

class Python {
    mode(langErrors) {
        return [StreamLanguage.define(python),
            // TODO fix this lang check
            EditorView.updateListener.of(vu => {
                if(vu.docChanged) {
                    const errors = [];
                    const doc = vu.state.doc.toString();
                    if(!doc.match(/int\s+attack\(.*\)/g)) {
                        errors.push('Required attack method missing: int attack()');
                    }
                    if(!doc.match(/int\s+cleanup\(.*\)/g)) {
                        errors.push('Required cleanup method missing: int cleanup()');
                    }
                    langErrors = errors;
                    displayLangErrors(errors);
                }
            })
        ];
    }
    bootstrap() {
        return ('def attack() -> int:\n' +
            '  return 0\n' +
            '\n' +
            '\n' +
            'def cleanup() -> int:\n' +
            '  return 0'
        );
    }
}

export default Python;
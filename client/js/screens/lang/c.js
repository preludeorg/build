import {c} from "@codemirror/legacy-modes/mode/clike"
import {EditorView} from "@codemirror/view";
import {StreamLanguage} from "@codemirror/language";
import {displayLangErrors} from "/client/js/screens/lang/prelude"

class C {
    mode(langErrors) {
        return [StreamLanguage.define(c),
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
            return ('#include <stdlib.h>\n' +
                '\n' +
                'int attack(void)\n' +
                '{\n' +
                '    char *command = "whoami";\n' +
                '    return system(command);\n' +
                '}\n' +
                '\n' +
                'int cleanup(void)\n' +
                '{\n' +
                '    return 0;\n' +
                '}\n' +
                '\n' +
                'int main(int argc, char *argv[])\n' +
                '{\n' +
                '    if (argc == 2) {\n' +
                '        if (strcmp(argv[1], "attack") == 0) {\n' +
                '            return attack();\n' +
                '        } else if (strcmp(argv[1], "cleanup") == 0) {\n' +
                '            return cleanup();\n' +
                '        }\n' +
                '    }\n' +
                '    return 2;\n' +
                '}'
            );
        }
}

export default C;
import {c} from "@codemirror/legacy-modes/mode/clike"
import {StreamLanguage} from "@codemirror/language";
import {createPreludeLangChecks} from "/client/js/screens/lang/prelude"

class C {
    mode(errors) {
        return [StreamLanguage.define(c),
            createPreludeLangChecks(
                /int\s+attack\(.*\)/g,
                /int\s+cleanup\(.*\)/g,
                errors
            )
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
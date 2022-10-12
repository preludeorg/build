import {c} from "@codemirror/legacy-modes/mode/clike"
import {StreamLanguage} from "@codemirror/language";
import {createPreludeLangChecks} from "/client/js/screens/lang/prelude"

class C {
    mode(name) {
        return [StreamLanguage.define(c),
            createPreludeLangChecks(
                /int\s+test\(.*\)/g,
                /int\s+clean\(.*\)/g,
                name
            )
        ];
    }
    bootstrap() {
            return ('#include <stdlib.h>\n' +
                '\n' +
                'int test(void)\n' +
                '{\n' +
                '    char *command = "whoami";\n' +
                '    return system(command);\n' +
                '}\n' +
                '\n' +
                'int clean(void)\n' +
                '{\n' +
                '    return 0;\n' +
                '}\n' +
                '\n' +
                'int main(int argc, char *argv[])\n' +
                '{\n' +
            '        if (strcmp(argv[1], "clean") == 0) {\n' +
            '            return clean();\n' +
            '        } else {\n' +
            '            return test();\n' +
            '        }\n' +
                '}'
            );
        }
}

export default C;
import {swift} from "@codemirror/legacy-modes/mode/swift"
import {StreamLanguage} from "@codemirror/language";
import {createPreludeLangChecks} from "/client/js/screens/lang/prelude"

class Swift {
    mode(name) {
        return [StreamLanguage.define(swift),
            createPreludeLangChecks(
                /\s+test\(.*\)/g,
                /\s+cleanup\(.*\)/g,
                name
            )
        ];
    }
    bootstrap() {
            return (
                'func test() {\n' +
                '    print("testing")\n' +
                '}\n' +
                '\n' +
                'func cleanup() {\n' +
                '    print("cleaning up")\n' +
                '}\n' +
                '\n' +
                'if CommandLine.arguments.contains("cleanup") {\n' +
                '    cleanup()\n' +
                '} else {\n' +
                '    test()\n' +
                '}'
            );
        }
}

export default Swift;
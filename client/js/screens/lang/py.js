import {python} from "@codemirror/legacy-modes/mode/python"
import {StreamLanguage} from "@codemirror/language";
import {createPreludeLangChecks} from "./prelude";

class Python {
    mode() {
        return [StreamLanguage.define(python),
            createPreludeLangChecks(
                /def\s+attack\(.*\)( -> int){0,1}:/g,
                /def\s+cleanup\(.*\)( -> int){0,1}:/g
            )
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
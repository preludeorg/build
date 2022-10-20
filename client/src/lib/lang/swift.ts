import { swift } from "@codemirror/legacy-modes/mode/swift";
import { StreamLanguage } from "@codemirror/language";
import { createPreludeLangChecks } from "./prelude";

class Swift {
  mode() {
    return [
      StreamLanguage.define(swift),
      createPreludeLangChecks(/\s+test\(.*\)/g, /\s+clean\(.*\)/g),
    ];
  }
  bootstrap() {
    return (
      "func test() {\n" +
      '    print("testing")\n' +
      "}\n" +
      "\n" +
      "func clean() {\n" +
      '    print("cleaning up")\n' +
      "}\n" +
      "\n" +
      'if CommandLine.arguments.contains("clean") {\n' +
      "    clean()\n" +
      "} else {\n" +
      "    test()\n" +
      "}"
    );
  }
}

export default Swift;

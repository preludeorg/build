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
    return `/*
NAME: $NAME
QUESTION: $QUESTION
CREATED: $CREATED
*/
import Foundation

func test() {
    print("Run test")
    exit(100)
}

func clean() {
    print("Clean up")
    exit(100)
}

if CommandLine.arguments.contains("clean") {
    clean()
} else {
    test()
}`;
  }
}

export default Swift;

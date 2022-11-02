import { swift } from "@codemirror/legacy-modes/mode/swift";
import { StreamLanguage } from "@codemirror/language";
import { Linter } from "./linter";

class Swift {
  static linters: Linter[] = [
    { regex: /\s+test\(.*\)/g, message: "Required test method missing" },
    { regex: /\s+clean\(.*\)/g, message: "Required clean method missing" },
  ];

  mode() {
    return [StreamLanguage.define(swift)];
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

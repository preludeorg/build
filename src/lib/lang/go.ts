import { go } from "@codemirror/legacy-modes/mode/go";
import { StreamLanguage } from "@codemirror/language";
import { Linter } from "./linter";
import template from "./templates/template.go?raw";

export default class GO {
  static linters: Linter[] = [
    { regex: /func\s+test\(.*\)/g, message: "Required test method missing" },
    { regex: /func\s+clean\(.*\)/g, message: "Required clean method missing" },
  ];
  static mode = [StreamLanguage.define(go)];
  static bootstrap = template;
}

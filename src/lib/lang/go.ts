import { go } from "@codemirror/legacy-modes/mode/go";
import { StreamLanguage } from "@codemirror/language";
import { Linter } from "./linter";
import template from "./templates/template.go?raw";

export default class GO {
  static linters: Linter[] = [
    { regex: /void\s+test\(.*\)/g, message: "Required test method missing" },
    { regex: /void\s+clean\(.*\)/g, message: "Required clean method missing" },
  ];
  static mode = [StreamLanguage.define(go)];
  static bootstrap = template;
}

import { rust } from "@codemirror/legacy-modes/mode/rust";
import { StreamLanguage } from "@codemirror/language";
import { Linter } from "./linter";
import template from "./templates/template.rust?raw";

export default class Rust {
  static linters: Linter[] = [
    { regex: /fn\s+test\(.*\)/g, message: "Required test method missing" },
    { regex: /fn\s+clean\(.*\)/g, message: "Required clean method missing" },
  ];
  static mode = [StreamLanguage.define(rust)];
  static bootstrap = template;
}

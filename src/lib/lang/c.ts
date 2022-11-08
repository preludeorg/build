import { c } from "@codemirror/legacy-modes/mode/clike";
import { StreamLanguage } from "@codemirror/language";
import { Linter } from "./linter";
import template from "./templates/template.c?raw";

export default class C {
  static linters: Linter[] = [
    { regex: /void\s+test\(.*\)/g, message: "Required test method missing" },
    { regex: /void\s+clean\(.*\)/g, message: "Required clean method missing" },
  ];
  static mode = [StreamLanguage.define(c)];
  static bootstrap = template;
}

import { StreamLanguage } from "@codemirror/language";
import { csharp } from "@codemirror/legacy-modes/mode/clike";
import { Linter } from "./linter";
import template from "./templates/template.cs?raw";

export default class CS {
  static linters: Linter[] = [
    { regex: /void\s+Test\(.*\)/g, message: "Required test method missing" },
    { regex: /void\s+Clean\(.*\)/g, message: "Required clean method missing" },
  ];
  static mode = [StreamLanguage.define(csharp)];
  static bootstrap = template;
}

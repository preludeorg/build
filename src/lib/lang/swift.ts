import { swift } from "@codemirror/legacy-modes/mode/swift";
import { StreamLanguage } from "@codemirror/language";
import { Linter } from "./linter";
import template from "./templates/template.swift?raw";

export default class Swift {
  static linters: Linter[] = [
    { regex: /\s+test\(.*\)/g, message: "Required test method missing" },
    { regex: /\s+clean\(.*\)/g, message: "Required clean method missing" },
  ];
  static mode = [StreamLanguage.define(swift)];
  static bootstrap = template;
}

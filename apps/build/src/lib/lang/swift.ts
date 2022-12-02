import { StreamLanguage } from "@codemirror/language";
import { swift } from "@codemirror/legacy-modes/mode/swift";
import template from "./templates/template.swift?raw";
import { Language } from "./types";

const language: Language = {
  ext: "swift",
  template,
  mode: [StreamLanguage.define(swift)],
  linters: [
    { regex: /\s+test\(.*\)/g, message: "Required test method missing" },
    { regex: /\s+clean\(.*\)/g, message: "Required clean method missing" },
  ],
};

export default language;

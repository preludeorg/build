import { StreamLanguage } from "@codemirror/language";
import { go } from "@codemirror/legacy-modes/mode/go";
import template from "./templates/template.go?raw";
import { Language } from "./types";

const language: Language = {
  ext: "go",
  template,
  mode: [StreamLanguage.define(go)],
  linters: [
    { regex: /func\s+test\(.*\)/g, message: "Required test method missing" },
    { regex: /func\s+clean\(.*\)/g, message: "Required clean method missing" },
  ],
};

export default language;

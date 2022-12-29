import { StreamLanguage } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import template from "./templates/template.c?raw";
import { Language } from "./types";

const language: Language = {
  ext: "sh",
  template,
  mode: [StreamLanguage.define(shell)],
  linters: [
    { regex: /_test\(\)/g, message: "Required test method missing" },
    { regex: /clean\(\)/g, message: "Required clean method missing" },
  ],
};

export default language;

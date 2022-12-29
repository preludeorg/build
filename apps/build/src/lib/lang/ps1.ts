import { StreamLanguage } from "@codemirror/language";
import { powerShell } from "@codemirror/legacy-modes/mode/powershell";
import template from "./templates/template.ps1?raw";
import { Language } from "./types";

const language: Language = {
  ext: "ps1",
  template,
  mode: [StreamLanguage.define(powerShell)],
  linters: [
    { regex: /function\s+Test\(.*\)/g, message: "Required test method missing" },
    { regex: /function\s+Clean\(.*\)/g, message: "Required clean method missing" },
  ],
};

export default language;

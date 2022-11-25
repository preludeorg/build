import { StreamLanguage } from "@codemirror/language";
import { csharp } from "@codemirror/legacy-modes/mode/clike";
import template from "./templates/template.cs?raw";
import { Language } from "./types";

const language: Language = {
  ext: "cs",
  template,
  mode: [StreamLanguage.define(csharp)],
  linters: [
    { regex: /void\s+Test\(.*\)/g, message: "Required test method missing" },
    { regex: /void\s+Clean\(.*\)/g, message: "Required clean method missing" },
  ],
};

export default language;

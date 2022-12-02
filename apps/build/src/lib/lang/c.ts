import { StreamLanguage } from "@codemirror/language";
import { c } from "@codemirror/legacy-modes/mode/clike";
import template from "./templates/template.c?raw";
import { Language } from "./types";

const language: Language = {
  ext: "c",
  template,
  mode: [StreamLanguage.define(c)],
  linters: [
    { regex: /void\s+test\(.*\)/g, message: "Required test method missing" },
    { regex: /void\s+clean\(.*\)/g, message: "Required clean method missing" },
  ],
};

export default language;

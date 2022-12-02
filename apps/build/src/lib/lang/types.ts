import { Extension } from "@codemirror/state";
import { Linter } from "./linter";

export interface Language {
  ext: string;
  template: string;
  linters: Linter[];
  mode: Extension[];
}

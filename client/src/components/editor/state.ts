import { getLanguageMode } from "./lang";

export function getModeExtensions(ext: string) {
  return getLanguageMode(ext).mode();
}

import C from "./c";
import CS from "./cs";
import Swift from "./swift";

export function getLanguage(ext: string) {
  if (ext === "cs") {
    return CS;
  } else if (ext === "swift") {
    return Swift;
  } else {
    return C;
  }
}

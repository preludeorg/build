import C from "./c";
import CS from "./cs";
import Swift from "./swift";
import Rust from "./rust";

export function getLanguage(ext: string) {
  if (ext === "cs") {
    return CS;
  } else if (ext === "swift") {
    return Swift;
  } else if (ext == "rust") {
    return Rust;
  } else {
    return C;
  }
}

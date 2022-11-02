import C from "./c";
import CS from "./cs";
import Swift from "./swift";

export function getLanguageMode(ext: string) {
  if (ext === "cs") {
    return new CS();
  } else if (ext === "swift") {
    return new Swift();
  } else {
    return new C();
  }
}

export function getLinters(ext: string) {
  if (ext === "cs") {
    return CS.linters;
  } else if (ext === "swift") {
    return Swift.linters;
  } else {
    return C.linters;
  }
}

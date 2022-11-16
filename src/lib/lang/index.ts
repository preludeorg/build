import C from "./c";
import CS from "./cs";
import GO from "./go";
import Swift from "./swift";

export function getLanguage(ext: string) {
  if (ext === "cs") {
    return CS;
  } else if (ext === "swift") {
    return Swift;
  } else if(ext === "go"){
    return GO;
  }else{
    return C;
  }
}

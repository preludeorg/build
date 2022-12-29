import c from "./c";
import cs from "./cs";
import go from "./go";
import ps1 from "./ps1";
import swift from "./swift";

const languages = [c, cs, go, ps1, swift];

export function getLanguage(ext: string) {
  const language = languages.find((language) => language.ext === ext);

  if (!language) {
    throw new Error("unsupported language");
  }

  return language;
}

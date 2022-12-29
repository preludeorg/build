import c from "./c";
import cs from "./cs";
import go from "./go";
import sh from "./sh";
import swift from "./swift";

const languages = [c, cs, go, sh, swift];

export function getLanguage(ext: string) {
  const language = languages.find((language) => language.ext === ext);

  if (!language) {
    throw new Error("unsupported language");
  }

  return language;
}

import c from "./c";
import cs from "./cs";
import go from "./go";
import swift from "./swift";

const languages = [c, cs, go, swift];

export function getLanguage(ext: string) {
  const language = languages.find((language) => language.ext === ext);

  if (!language) {
    throw new Error("unsupported language");
  }

  return language;
}

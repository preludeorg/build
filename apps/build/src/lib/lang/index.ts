import go from "./go";

const languages = [go];

export function getLanguage(ext: string) {
  const language = languages.find((language) => language.ext === ext);

  if (!language) {
    throw new Error("unsupported language");
  }

  return language;
}

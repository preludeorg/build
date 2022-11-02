export interface Linter {
  regex: RegExp;
  message: string;
}

export const lint = (doc: string, linters: Linter[]) => {
  return linters
    .map((linter) => {
      if (doc.match(linter.regex) === null) {
        return linter.message;
      }
    })
    .filter((result) => !!result) as string[];
};

export const validate = (doc: string, linters: Linter[]) => {
  return lint(doc, linters).length === 0;
};

export function commonBeginning(options: string[]) {
  let index = 0;
  for (let i = index; i < options[0].length; i++) {
    if (
      options.every((option) => option.charAt(i) === options[0].charAt(i))
    ) {
      index++;
    }
  }
  return options[0].slice(0, index);
};
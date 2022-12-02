export type CommandReturn = JSX.Element | Promise<JSX.Element>;
export interface Command {
  args?: string;
  alias?: string[];
  desc?: string | JSX.Element;
  hidden?: () => boolean;
  enabled?: () => boolean;
  exec: (args: string) => CommandReturn;
}

export type Commands = Record<string, Command>;

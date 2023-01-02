import styles from "../../components/terminal/commands.module.css";
import { createTestCommand } from "./create-test-command";
import { deleteTestCommand } from "./delete-test-command";
import { listTestsCommand } from "./list-test-command";
import { Command, Commands } from "./types";
import { useCommand } from "./use-command";

const helpCommand: Command = {
  alias: ["h"],
  hidden: () => true,
  exec() {
    const commandsList = Object.keys(commands)
      .filter((command) => commands[command].enabled?.() ?? true)
      .map((command) => ({
        name: command,
        args: commands[command].args ?? "",
        desc: commands[command].desc ?? "",
        alias: commands[command].alias
          ? ", " + commands[command].alias?.join(", ")
          : "",
      }));
    return (
      <div className={styles.help}>
        <ul>
          {commandsList.map((command) => (
            <li key={command.name}>
              <span>
                {command.name}
                {command.alias} {command.args}
              </span>{" "}
              <p>{command.desc} </p>
            </li>
          ))}
        </ul>
      </div>
    );
  },
};

export const commands: Commands = {
  use: useCommand,
  "list-tests": listTestsCommand,
  "create-test": createTestCommand,
  "delete-test": deleteTestCommand,
  help: helpCommand,
};

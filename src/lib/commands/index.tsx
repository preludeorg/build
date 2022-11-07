import styles from "../../components/terminal/command.module.css";
import { Commands } from "./types";
import { useCommand } from "./use-command";
import { listTestsCommand } from "./list-test-command";
import { createTestCommand } from "./create-test-command";
import { deleteTestCommand } from "./delete-test-command";
import { listVariantsCommand } from "./list-variants-command";
import { createVariantCommand } from "./create-variant-command";
import { deleteVariantCommand } from "./delete-variant-command";

export const commands: Commands = {
  use: useCommand,
  "list-tests": listTestsCommand,
  "create-test": createTestCommand,
  "delete-test": deleteTestCommand,
  "list-variants": listVariantsCommand,
  "create-variant": createVariantCommand,
  "delete-variant": deleteVariantCommand,
  help: {
    hidden: true,
    exec() {
      const commandsList = Object.keys(commands)
        .filter((command) => !commands[command].hidden)
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
          <strong>Commands</strong>
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
  },
};

import classNames from "classnames";
import { useMemo, useState } from "react";
import { terminalState } from "../../hooks/terminal-store";
import { useKeyboard } from "../../hooks/use-keyboard";
import { combine, ModifierKeys, press, SpecialKeys } from "../../lib/keyboard";
import ArrowRight from "../icons/arrow-right";
import styles from "./commands.module.css";
import Focusable from "./focusable";
import Readline, { useReadline } from "./readline";

export interface TerminalListProps<T> {
  title?: string | JSX.Element;
  items: T[];
  keyProp: (item: T) => string;
  filterOn: (item: T) => string;
  renderItem: (item: T) => JSX.Element;
  onSelect: (item: T) => void;
  onExit: () => void;
  signal: AbortSignal;
}

const ITEM_PER_PAGE = 5;

function TerminalList<T>({
  title,
  items,
  renderItem,
  keyProp,
  onSelect,
  onExit,
  filterOn,
}: TerminalListProps<T>) {
  const [index, setValue] = useState(1);
  const [exited, setExited] = useState(false);
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<"list" | "filter">("list");
  const [filter, setFilter] = useState("");

  const filteredItems = useMemo(() => {
    if (filter === "") {
      return items;
    }

    return items.filter((item) =>
      filterOn(item).toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter]);

  const keyboard = useKeyboard([
    press("f").do(() => {
      setMode("filter");
      setPage(1);
    }),
    press(SpecialKeys.ESCAPE, "e").do(() => {
      setExited(true);
      onExit();
    }),
    press(SpecialKeys.ENTER).do(() => {
      const itemIndex = index - 1 + offset;
      setExited(true);
      onSelect(filteredItems[itemIndex]);
    }),
    press(SpecialKeys.ARROW_RIGHT).do(() => {
      const nextPage = page + 1;

      if (nextPage > totalPages) {
        return;
      }

      setPage(nextPage);
      setValue(1);
    }),
    press(SpecialKeys.ARROW_LEFT).do(() => {
      const prevPage = page - 1;

      if (prevPage <= 0) {
        return;
      }

      setPage(prevPage);
      setValue(1);
    }),
    press(SpecialKeys.ARROW_UP).do(() => {
      if (index === 1) {
        setValue(pageItems.length);
        return;
      }
      setValue(index - 1);
    }),
    press(SpecialKeys.ARROW_DOWN).do(() => {
      if (index === pageItems.length) {
        setValue(1);
        return;
      }
      setValue(index + 1);
    }),
  ]);

  const readline = useReadline({
    onChange(input) {
      setFilter(input);
    },
    extraMacros: () => [
      press(SpecialKeys.ESCAPE, combine(ModifierKeys.CTRL, "c")).do(() => {
        setFilter("");
        setValue(1);
        setMode("list");
      }),
      press(SpecialKeys.ENTER).do(() => {
        if (index !== null) {
          const itemIndex = index - 1 + offset;
          setExited(true);
          onSelect(filteredItems[itemIndex]);
        }
      }),
    ],
  });

  const totalPages = Math.ceil(filteredItems.length / ITEM_PER_PAGE);
  const offset = (page - 1) * ITEM_PER_PAGE;
  const pageItems = filteredItems.slice(offset, page * ITEM_PER_PAGE);

  if (exited) {
    return <></>;
  }

  return (
    <div className={styles.terminalList}>
      <div>
        {title ? title : null}
        <div className={styles.itemList}>
          {pageItems.map((item, idx) => {
            const selected = idx + 1 === index && mode === "list";
            return (
              <div
                key={keyProp(item)}
                className={classNames(styles.item, {
                  [styles.selected]: selected,
                })}
              >
                <div className={styles.cursor}>{selected ? ">" : ""}</div>
                <div className={styles.content}>{renderItem(item)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {mode === "list" && (
        <Focusable
          onKeyDown={(e) => {
            keyboard.handleEvent(e);
          }}
          render={() => (
            <div className={styles.listBar}>
              <span className={styles.extra}>
                <strong>Page:</strong>
                {page}/{totalPages}
              </span>
              <span className={styles.extra}>
                <strong>Total:</strong>
                {filteredItems.length}
              </span>
              <span className={styles.extra}>
                <strong>Filter: </strong> f
              </span>
              <span className={styles.extra}>
                <strong>Exit: </strong> esc
              </span>

              <span className={styles.extra}>
                <strong>Change Selection: </strong>
                <ArrowRight className={styles.rotateNeg90} />
                <ArrowRight className={styles.rotate90} />
              </span>
              <span className={styles.extra}>
                <strong>Change Page: </strong>
                <ArrowRight className={styles.rotate180} />
                <ArrowRight />
              </span>
            </div>
          )}
        />
      )}
      {mode === "filter" && (
        <div className={styles.listBar}>
          <span className={styles.extra}>
            <strong>Done: </strong> enter
          </span>
          <span className={styles.extra}>
            <strong>Exit: </strong> esc
          </span>

          <span className={styles.extra}>
            <strong>Filter: </strong>
          </span>

          <Readline {...readline} />
        </div>
      )}
    </div>
  );
}

export default TerminalList;

type ListerProps<T> = Omit<TerminalListProps<T>, "onSelect" | "onExit">;

export async function terminalList<T>({
  title,
  items,
  keyProp,
  renderItem,
  filterOn,
  signal,
}: ListerProps<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const { write } = terminalState();

    write(
      <TerminalList
        title={title}
        items={items}
        filterOn={filterOn}
        keyProp={keyProp}
        renderItem={renderItem}
        onSelect={(item) => {
          resolve(item);
        }}
        onExit={() => {
          reject(new Error("exited"));
        }}
        signal={signal}
      />
    );
  });
}

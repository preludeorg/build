import classNames from "classnames";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { terminalState } from "../../hooks/terminal-store";

import focusTerminal from "../../utils/focus-terminal";
import ArrowRight from "../icons/arrow-right";
import styles from "./commands.module.css";

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
  signal,
}: TerminalListProps<T>) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);
  const prevRef = useRef<HTMLElement | Element | null>(null);
  const [index, setValue] = useState(1);
  const [exited, setExited] = useState(false);
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<"list" | "filter">("list");
  const [filter, setFilter] = useState("");

  const exit = () => {
    setExited(true);
    onExit();
  };

  useEffect(() => {
    if (!signal) {
      return;
    }

    signal.addEventListener("abort", exit);
    return () => {
      signal.removeEventListener("abort", exit);
    };
  }, []);

  useEffect(() => {
    prevRef.current = document.activeElement || document.body;
  }, []);

  useEffect(() => {
    if (mode === "filter") {
      filterRef.current?.focus();
    } else {
      pickerRef.current?.focus();
    }
  }, [mode]);

  const filteredItems = useMemo(() => {
    if (filter === "") {
      return items;
    }

    return items.filter((item) =>
      filterOn(item).toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter]);

  const totalPages = Math.ceil(filteredItems.length / ITEM_PER_PAGE);
  const offset = (page - 1) * ITEM_PER_PAGE;
  const pageItems = filteredItems.slice(offset, page * ITEM_PER_PAGE);

  const handleKey: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "f") {
      e.preventDefault();
      setMode("filter");
      setPage(1);
      return false;
    }

    if (e.key === "e" || e.key === "Escape") {
      // or control c
      e.preventDefault();
      setExited(true);
      onExit();
      focusTerminal();
      return false;
    }

    if (e.key === "Enter" && index !== null) {
      e.preventDefault();
      const itemIndex = index - 1 + offset;
      setExited(true);
      onSelect(filteredItems[itemIndex]);
      focusTerminal();
      return false;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextPage = page + 1;

      if (nextPage > totalPages) {
        return;
      }

      setPage(nextPage);
      setValue(1);
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevPage = page - 1;

      if (prevPage <= 0) {
        return;
      }

      setPage(prevPage);
      setValue(1);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();

      if (index === 1) {
        setValue(pageItems.length);
        return;
      }
      setValue(index - 1);
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();

      if (index === pageItems.length) {
        setValue(1);
        return;
      }
      setValue(index + 1);
    }

    return true;
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.value === "") {
      return;
    }
    const parse = e.target.value.split("");
    const val = z
      .number()
      .min(1)
      .max(pageItems.length)
      .parse(parseInt(parse[parse.length - 1], 10));

    setValue(val);
  };

  const handleFilterKey: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Escape") {
      //or control c

      e.preventDefault();
      setFilter("");
      setValue(1);
      setMode("list");
      pickerRef.current?.focus();
      return false;
    }

    if (e.key === "Enter" && filteredItems.length !== 0) {
      e.preventDefault();
      setValue(1);
      setMode("list");
      return false;
    }

    return true;
  };

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
            <input
              className={styles.filterInput}
              placeholder="Type a phrase..."
              ref={filterRef}
              type="text"
              value={filter}
              onKeyDown={handleFilterKey}
              onChange={(e) => setFilter(e.target.value)}
            />
          </span>
        </div>
      )}
      {mode === "list" && (
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
          <input
            ref={pickerRef}
            type="number"
            min="1"
            maxLength={2}
            value={index ?? ""}
            onKeyDown={handleKey}
            onChange={handleChange}
          />
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

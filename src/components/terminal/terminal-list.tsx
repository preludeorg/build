import React, { useEffect, useState, useRef } from "react";
import styles from "./commands.module.css";
import { z } from "zod";
import ArrowRight from "../icons/arrow-right";
import cx from "classnames";
import { terminalState } from "../../hooks/terminal-store";

export interface TerminalListProps<T> {
  title?: string | JSX.Element;
  items: T[];
  keyProp: (item: T) => string;
  renderItem: (item: T) => JSX.Element;
  onSelect: (item: T) => void;
  onExit: () => void;
}

const ITEM_PER_PAGE = 5;

const TerminalList = <T extends {}>({
  title,
  items,
  renderItem,
  keyProp,
  onSelect,
  onExit,
}: TerminalListProps<T>): JSX.Element => {
  const pickerRef = useRef<HTMLInputElement>(null);
  const prevRef = useRef<HTMLElement | Element | null>(null);
  const [index, setValue] = useState(1);
  const [exited, setExited] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    prevRef.current = document.activeElement || document.body;
  }, []);

  useEffect(() => {
    pickerRef.current?.focus();
  }, [pickerRef.current]);

  const totalPages = Math.ceil(items.length / ITEM_PER_PAGE);
  const offset = (page - 1) * ITEM_PER_PAGE;
  const pageItems = items.slice(offset, page * ITEM_PER_PAGE);

  const handleKey: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "e" || e.key === "Escape") {
      e.preventDefault();
      setExited(true);
      onExit();
      document.getElementById("terminal")?.focus();

      return false;
    }

    if (e.key === "Enter" && index !== null) {
      e.preventDefault();
      const itemIndex = index - 1 + offset;
      setExited(true);
      onSelect(items[itemIndex]);
      document.getElementById("terminal")?.focus();
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
    try {
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
    } catch (e) {}
  };

  if (exited) {
    return <></>;
  }

  return (
    <div
      className={styles.manifest}
      onClick={() => {
        pickerRef.current?.focus();
      }}
    >
      <div>
        {title ? title : null}
        <ol>
          {pageItems.map((item, idx) => {
            return (
              <li
                key={keyProp(item)}
                className={cx({ [styles.selected]: idx + 1 === index })}
              >
                {renderItem(item)}
              </li>
            );
          })}
        </ol>
      </div>

      <div className={styles.listBar}>
        <span className={styles.extra}>
          <strong>Current: </strong>
          <input
            ref={pickerRef}
            type="number"
            min="1"
            maxLength={2}
            value={index ?? ""}
            onKeyDown={handleKey}
            onChange={handleChange}
          />
        </span>
        <span className={styles.extra}>
          <strong>Page:</strong>
          {page}/{totalPages}
        </span>
        <span className={styles.extra}>
          <strong>Total:</strong>
          {items.length}
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
    </div>
  );
};

export default TerminalList;

type ListerProps<T> = Omit<TerminalListProps<T>, "onSelect" | "onExit">;

export async function teminalList<T extends {}>({
  title,
  items,
  keyProp,
  renderItem,
}: ListerProps<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const { write } = terminalState();
    write(
      <TerminalList
        title={title}
        items={items}
        keyProp={keyProp}
        renderItem={renderItem}
        onSelect={(ttp) => {
          resolve(ttp);
        }}
        onExit={() => {
          reject(new Error("exited"));
        }}
      />
    );
  });
}

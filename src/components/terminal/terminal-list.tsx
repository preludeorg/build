import React, { useEffect, useState, useRef } from "react";
import styles from "./commands.module.css";
import { z } from "zod";
import ArrowRight from "../icons/arrow-right";

interface Props<T> {
  title: string | JSX.Element;
  items: T[];
  keyProp: (item: T) => string;
  renderItem: (item: T) => JSX.Element;
  onSelect: (item: T) => void;
}

const ITEM_PER_PAGE = 5;

const TerminalList = <T extends {}>({
  title,
  items,
  renderItem,
  keyProp,
  onSelect,
}: Props<T>): JSX.Element => {
  const pickerRef = useRef<HTMLInputElement>(null);
  const prevRef = useRef<HTMLElement | Element | null>(null);
  const [index, setValue] = useState<number | null>(null);
  const [selection, setSelection] = useState<T | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    prevRef.current = document.activeElement || document.body;
  }, []);

  useEffect(() => {
    pickerRef.current?.focus();
  }, [pickerRef.current]);

  const totalPages = Math.round(items.length / ITEM_PER_PAGE);
  const offset = (page - 1) * ITEM_PER_PAGE;
  const pageItems = items.slice(offset, page * ITEM_PER_PAGE);

  const handleKey: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "e") {
      e.preventDefault();
      return false;
    }

    if (e.key === "Enter" && index !== null) {
      e.preventDefault();
      const itemIndex = index - 1 + offset;
      setSelection(items[itemIndex]);
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
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevPage = page - 1;

      if (prevPage <= 0) {
        return;
      }

      setPage(prevPage);
    }

    return true;
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    try {
      if (e.target.value === "") {
        setValue(null);
        return;
      }

      const val = z
        .number()
        .min(1)
        .max(items.length)
        .parse(parseInt(e.target.value, 10));

      setValue(val);
    } catch (e) {}
  };

  if (selection) {
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
        {title}
        <ol>
          {pageItems.map((item) => {
            return <li key={keyProp(item)}>{renderItem(item)}</li>;
          })}
        </ol>
      </div>
      <div>
        <span>
          Type the number and hit <strong>Enter</strong> to select (1-
          {pageItems.length})
        </span>{" "}
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
      <div className={styles.listBar}>
        <span className={styles.extra}>
          <strong>Total:</strong>
          {items.length}
        </span>
        <span className={styles.extra}>
          <strong>Page:</strong>
          {page}/{totalPages}
        </span>
        <span className={styles.extra}>
          <strong>Previous Page: </strong>
          <ArrowRight className={styles.rotate180} />
        </span>
        <span className={styles.extra}>
          <strong>Next Page: </strong> <ArrowRight />
        </span>
      </div>
    </div>
  );
};

export default TerminalList;

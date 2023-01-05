import { useState } from "react";

export const useAccordion = (initial = false) => {
  const [expanded, setExpanded] = useState(initial);
  return {
    expanded,
    toogle: () => setExpanded((expanded) => !expanded),
    setExpanded,
  };
};

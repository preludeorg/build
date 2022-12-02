import { useEffect, useRef, useState } from "react";

export const useDefaultHeight = () => {
  const [defaultHeight, setDefaultHeight] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      setDefaultHeight("30vh");
      return;
    }

    const sectionHeight = ref.current.offsetHeight + 100;
    const spaceRemaining = window.innerHeight - sectionHeight;
    const percentage = (spaceRemaining / window.innerHeight) * 100;

    if (percentage < 30) {
      setDefaultHeight("30vh");
      return;
    }

    setDefaultHeight(percentage.toFixed(2) + "vh");
  }, [ref.current]);

  return { ref, defaultHeight };
};

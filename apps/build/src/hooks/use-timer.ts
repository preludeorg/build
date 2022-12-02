import { useRef, useState } from "react";

export const useTimer = ({
  time,
  onComplete,
}: {
  time: number;
  onComplete?: () => void;
}) => {
  const interval = useRef<number | null>(null);
  const timeout = useRef<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  const minutes = Math.floor(remaining / 1000 / 60);
  const seconds = remaining / 1000 - minutes * 60;
  const percent = (remaining / time) * 100;

  const start = () => {
    cancel();
    setRemaining(time);
    if (onComplete) {
      timeout.current = setTimeout(onComplete, time);
    }

    interval.current = setInterval(() => {
      setRemaining((state) => (state <= 0 ? 0 : state - 1000));
    }, 1000);
  };

  const cancel = () => {
    timeout.current && clearTimeout(timeout.current);
    interval.current && clearInterval(interval.current);
  };

  return { remaining, minutes, seconds, start, cancel, percent };
};

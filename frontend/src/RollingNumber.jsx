import { useEffect, useRef, useState } from "react";

/**
 * Renders a numeric string as a row of independently-rolling digits,
 * like an airport departure board / mechanical odometer.
 * Each digit animates from its previous value to its new value.
 */
function RollingDigit({ digit }) {
  const isNumeral = /[0-9]/.test(digit);
  const targetValue = isNumeral ? parseInt(digit, 10) : null;
  const prevValue = useRef(targetValue);
  const [displayOffset, setDisplayOffset] = useState(0);

  useEffect(() => {
    if (targetValue === null) return;
    prevValue.current = targetValue;
  }, [targetValue]);

  if (!isNumeral) {
    return <span className="rd-static">{digit}</span>;
  }

  return (
    <span className="rd-digit" aria-hidden="true">
      <span
        className="rd-strip"
        style={{ transform: `translateY(-${targetValue * 10}%)` }}
      >
        {Array.from({ length: 10 }).map((_, n) => (
          <span className="rd-cell" key={n}>
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function RollingNumber({ value, className = "" }) {
  const chars = value.split("");
  return (
    <span className={`rd-row ${className}`} role="text" aria-label={value}>
      {chars.map((c, i) => (
        <RollingDigit digit={c} key={i} />
      ))}
    </span>
  );
}

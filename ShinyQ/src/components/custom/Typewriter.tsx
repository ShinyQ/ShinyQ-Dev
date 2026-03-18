import React, { useEffect, useRef, useState } from "react";

interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, className = "", speed = 20 }) => {
  const [isDone, setIsDone] = useState(false);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setIsDone(false);
    const el = spanRef.current;
    if (!el) return;
    el.textContent = "";

    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i++];
      } else {
        clearInterval(interval);
        setIsDone(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <p className={className} aria-label={text}>
      <span ref={spanRef} />
      {isDone ? <span className="blink-cursor">|</span> : <span>|</span>}
    </p>
  );
};

export default Typewriter;

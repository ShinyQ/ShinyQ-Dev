import React, { useEffect, useState } from "react";

interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number; 
}

const Typewriter: React.FC<TypewriterProps> = ({ text, className = "", speed = 20 }) => {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setIsDone(false);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => {
        if (i < text.length) {
          return prev + text[i++];
        } else {
          clearInterval(interval);
          setIsDone(true);
          return prev;
        }
      });
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <p className={className} aria-label={text}>
      {displayed}
      {isDone ? <span className="blink-cursor">|</span> : <span>|</span>}
    </p>
  );
};

export default Typewriter; 
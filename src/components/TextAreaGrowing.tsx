"use client"
import { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import TextareaAutosize from "react-textarea-autosize";

interface AutoGrowTextareaProps {
  children: React.ReactNode;
  value: string;
  setContent: (value: string) => void;
  disabled: boolean;
  id: string;
  className?: string;
}

export default function AutoGrowTextarea({
  children,
  value,
  setContent,
  disabled,
  id,
  className = "",
}: AutoGrowTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const screen = useRef<HTMLDivElement>(null);

  // Resize handler
  const resize = () => {
    const txt = textareaRef.current;
    const display = screen.current;

    console.log(screen.current?.offsetHeight)

    if (txt) {
      txt.style.height = "auto";
      txt.style.height = `${display?.offsetHeight}px`;
    }
  };

  // Resize whenever value changes (like after LS restore)
  useEffect(() => {
    resize();
  }, [value, disabled]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    resize();
    setContent(e.target.value);
  };

  const linkRegex = /(https?:\/\/[^\s]+)/g;

  function highlightLinks(text: string) {
    const parts = text.split(linkRegex);

    return parts.map((part, i) =>
      linkRegex.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-700"
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  }

  return (
    <div className="group relative">
      <label
        className={`origin-start text-muted-foreground/70 absolute top-0 block translate-y-2 cursor-text px-1 text-sm transition-all duration-500 ease-in-out
    ${disabled ? "group-focus-within:text-foreground group-focus-within:pointer-events-none group-focus-within:-translate-y-1/2 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium" : ""}
  `}
      >
        {!value && (
          <span
            className={`inline-flex px-2 rounded-md
            ${disabled ? "group-focus-within:bg-muted-foreground group-focus-within:text-background" : ""}
            pointer-events-none
          `}
          >
            {children}
          </span>
        )}
      </label>

      <TextareaAutosize
        id={id}
        placeholder=" "
        onChange={handleInput}
        minRows={4}
        className={`resize-none w-full z-auto overflow-hidden rounded-none 
          bg-transparent shadow-none text-sm p-2 text-muted-foreground/80
          ${className} ${!disabled && "pointer-events-none"}`}
        value={value}
        readOnly={!disabled}
        autoCorrect="off"
        autoComplete="off"
        spellCheck="false"
      />

    </div>
  );
}

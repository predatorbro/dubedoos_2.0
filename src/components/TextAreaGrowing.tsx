"use client"

import { useEffect, useRef } from "react";

interface AutoGrowTextareaProps {
  children: React.ReactNode;
  value: string;
  setContent: (value: string) => void;
  disabled: boolean;
  id: string;
  className?: string;
  cols?: number;
  max?: boolean;
}

export default function AutoGrowTextarea({
  children,
  value,
  setContent,
  disabled,
  id,
  className = "",
  cols = 1,
  max = false,
}: AutoGrowTextareaProps) {

  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Set dynamic height when max is true
  useEffect(() => {
    if (max && textareaRef.current) {
      const textarea = textareaRef.current;
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight + some padding
      const newHeight = Math.max(textarea.scrollHeight, 400); // Minimum 400px
      textarea.style.height = `${newHeight}px`;
    }
  }, [max, value]);

  // Fixed heights based on column layout or max height
  const getHeightClass = () => {
    // If max is true, let useEffect handle the dynamic height
    if (max) {
      return "min-h-[400px]"; // Minimum height, will be expanded by useEffect
    }

    // Otherwise, use fixed heights based on column layout
    switch (cols) {
      case 1:
        return "h-32 sm:h-40 md:h-48 lg:h-56"; // Tallest for single column
      case 2:
        return "h-24 sm:h-32 md:h-36 lg:h-42"; // Medium for two columns
      case 3:
        return "h-20 sm:h-24 md:h-28 lg:h-32"; // Shortest for three columns
      default:
        return "h-32 sm:h-40 md:h-48 lg:h-56"; // Default to single column
    }
  };

  return (
    <div className="group relative">
      <label
        className={`origin-start text-muted-foreground/70 absolute top-0 block translate-y-2 cursor-text px-1 text-sm transition-all duration-500 ease-in-out
    ${disabled ? "group-focus-within:text-foreground group-focus-within:pointer-events-none group-focus-within:-translate-y-1/2 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium" : ""}`}
      >
        {!value && (
          <span
            className={`inline-flex px-2 rounded-md
            ${disabled ? "group-focus-within:bg-muted-foreground group-focus-within:text-background" : ""}
            pointer-events-none`}
          >
            {children}
          </span>
        )}
      </label>

      <textarea
        ref={textareaRef}
        id={id}
        placeholder=""
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
        className={`resize-none w-full z-auto overflow-y-auto rounded-none
          bg-transparent shadow-none text-sm p-2 text-muted-foreground/80
          ${getHeightClass()} ${className} ${!disabled && "pointer-events-none"}`}
        value={value}
        readOnly={!disabled}
        autoCorrect="off"
        autoComplete="off"
        spellCheck="false"
      />

    </div>
  );
}

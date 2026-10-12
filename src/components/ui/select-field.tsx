"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = { value: string; label: string };

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  error,
  name,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  required?: boolean;
  error?: string;
  name?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();
  const listId = `${id}-list`;
  const selected = options.find((o) => o.value === value);
  const activeId = options[active] ? `${id}-${options[active].value}` : undefined;

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector("[data-active='true']") as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function choose(next: string) {
    onChange(next);
    setOpen(false);
    requestAnimationFrame(() => buttonRef.current?.focus());
  }

  function onTriggerKey(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const idx = Math.max(0, options.findIndex((o) => o.value === value));
      setActive(event.key === "ArrowUp" ? Math.max(0, idx) : idx);
      setOpen(true);
    }
  }

  function onListKey(event: React.KeyboardEvent<HTMLUListElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[active];
      if (option) choose(option.value);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(options.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      {name && <input type="hidden" name={name} value={value} />}
      <span id={id} className="form-label">
        {label}
      </span>
      <button
        ref={buttonRef}
        type="button"
        className="form-input mt-2 flex w-full items-center justify-between gap-3 text-left font-sans"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={id}
        aria-controls={listId}
        aria-required={required}
        aria-invalid={Boolean(error)}
        onClick={() => {
          const idx = Math.max(0, options.findIndex((o) => o.value === value));
          setActive(idx);
          setOpen((v) => !v);
        }}
        onKeyDown={onTriggerKey}
      >
        <span className={cn("min-w-0 truncate", !selected && "text-[#5c5954]")}>{selected?.label ?? placeholder}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          className={cn("shrink-0 text-ink transition-transform duration-200", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={0}
          aria-labelledby={id}
          aria-activedescendant={activeId}
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto overscroll-contain border border-line bg-ivory py-1"
          onKeyDown={onListKey}
        >
          {options.map((option, i) => (
            <li
              key={option.value}
              id={`${id}-${option.value}`}
              role="option"
              aria-selected={option.value === value}
              data-active={i === active}
              className={cn(
                "cursor-pointer px-3 py-2.5 text-[15px] text-ink",
                option.value === value && "bg-forest text-soft",
                option.value !== value && i === active && "bg-offwhite-200",
              )}
              onMouseEnter={() => setActive(i)}
              onPointerDown={(event) => {
                event.preventDefault();
                choose(option.value);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p className="mt-2 text-[13px] text-ember" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

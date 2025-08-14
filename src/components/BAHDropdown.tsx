"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import type { BahEntry } from "@/utils/bahTop";
import type { DepStatus } from "@/lib/calc";

type Props = {
  options: readonly BahEntry[];
  value?: string;                 // current ZIP
  onChange: (zip: string) => void;
  depStatus: DepStatus;           // to show the monthly amount in the list
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export default function BAHDropdown({
  options,
  value,
  onChange,
  depStatus,
  placeholder = "Search city or ZIP…",
  disabled,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const selected = useMemo(
    () => options.find(o => o.zip === value) || null,
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 200); // cap for perf
    return options.filter(o => {
      const hay = `${o.zip} ${o.name}`.toLowerCase();
      return hay.includes(q);
    }).slice(0, 200);
  }, [options, query]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (open) {
      setActiveIndex(-1);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  function choose(zip: string) {
    onChange(zip);
    setOpen(false);
    setQuery("");
  }

  function amountFor(o: BahEntry) {
    const amt = depStatus === "with" ? o.withDep : o.withoutDep;
    return `$${amt.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowDown") {
      setActiveIndex(i => Math.min((i ?? -1) + 1, filtered.length - 1));
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowUp") {
      setActiveIndex(i => Math.max((i ?? filtered.length) - 1, 0));
      e.preventDefault();
      return;
    }
    if (e.key === "Enter" && activeIndex >= 0 && filtered[activeIndex]) {
      choose(filtered[activeIndex].zip);
      e.preventDefault();
    }
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`w-full border rounded-lg p-2 text-left flex items-center justify-between
          ${disabled ? "bg-gray-100 text-gray-400" : "bg-white hover:bg-gray-50"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onKeyDown={onKeyDown}
      >
        <span className="truncate">
          {selected ? `${selected.zip} — ${selected.name}` : "Select BAH locality"}
        </span>
        <span className="text-xs text-gray-500 ml-2">
          {selected ? amountFor(selected) : ""}
        </span>
      </button>

      {open && !disabled && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border bg-white shadow-lg">
          <div className="p-2 border-b">
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-md border px-2 py-1 text-sm"
              onKeyDown={onKeyDown}
              aria-autocomplete="list"
            />
          </div>
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="max-h-64 overflow-auto py-1"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">No matches</li>
            )}
            {filtered.map((o, i) => {
              const isActive = i === activeIndex;
              const isSelected = o.zip === selected?.zip;
              return (
                <li
                  key={o.zip}
                  role="option"
                  aria-selected={isSelected}
                  className={`px-3 py-2 text-sm flex items-center justify-between cursor-pointer
                    ${isActive ? "bg-blue-50" : ""}
                    ${isSelected ? "font-medium" : ""}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={e => { e.preventDefault(); choose(o.zip); }}
                >
                  <span className="truncate">{o.zip} — {o.name}</span>
                  <span className="text-xs text-gray-600 ml-3">{amountFor(o)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

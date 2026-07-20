"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { gsap } from "gsap";

const themes = [
  { name: "void", color: "#4dd8ff" },
  { name: "nebula", color: "#b565f5" },
  { name: "solstice", color: "#ff8a3d" },
  { name: "aurora", color: "#4dffb8" },
  { name: "eclipse", color: "#d9d9e0" },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, scale: 0.95, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "power2.out" }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const closeDropdown = () => {
    if (dropdownRef.current) {
      gsap.to(dropdownRef.current, {
        opacity: 0,
        scale: 0.95,
        y: 10,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => setIsOpen(false),
      });
    } else {
      setIsOpen(false);
    }
  };

  const toggleDropdown = () => {
    if (isOpen) {
      closeDropdown();
    } else {
      setIsOpen(true);
    }
  };

  const selectTheme = (themeName: string) => {
    setTheme(themeName);
    closeDropdown();
  };

  if (!mounted) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background-elevated opacity-50 cursor-not-allowed">
          <div className="w-2.5 h-2.5 rounded-full bg-muted animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Loading...
          </span>
        </button>
      </div>
    );
  }

  const currentTheme = themes.find((t) => t.name === theme) || themes[0];

  return (
    <div className="fixed bottom-6 left-6 z-50 font-sans">
      <button
        ref={triggerRef}
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background-elevated hover:bg-background-elevated/80 transition-colors shadow-lg cursor-pointer"
      >
        <span
          className="w-2.5 h-2.5 rounded-full transition-transform duration-300"
          style={{ backgroundColor: currentTheme.color }}
        />
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {currentTheme.name}
        </span>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          role="listbox"
          className="absolute bottom-12 left-0 min-w-[140px] p-1.5 rounded-lg border border-border bg-background-elevated shadow-xl flex flex-col gap-1 origin-bottom-left"
        >
          {themes.map((t) => (
            <button
              key={t.name}
              role="option"
              aria-selected={theme === t.name}
              onClick={() => selectTheme(t.name)}
              className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-colors hover:bg-foreground/5 cursor-pointer ${
                theme === t.name ? "text-foreground font-bold" : "text-muted"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: t.color }}
              />
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

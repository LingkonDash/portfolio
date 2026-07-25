import React from "react";

export default function ShipIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2L6 8L3 15L12 13L21 15L18 8L12 2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 13L8.5 20L12 18L15.5 20L12 13Z"
        fill="currentColor"
        opacity="0.8"
      />
    </svg>
  );
}

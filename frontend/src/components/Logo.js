import React from "react";
export default function Logo() {
  return (
    <div className="logo">
      <div className="logo-mark">
        <svg viewBox="0 0 24 24">
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" />
        </svg>
      </div>
      <div className="logo-text">
        Farm<span>Shield</span>
      </div>
    </div>
  );
}
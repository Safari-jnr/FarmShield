import React from "react";
import { useState, useCallback } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);
  return [toast, show];
}

export default function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`toast ${type}`}>{msg}</div>;
}
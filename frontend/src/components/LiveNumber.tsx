"use client";

import React, { useEffect, useRef, useState } from "react";

export function LiveNumber({
  value,
  className = "",
  format,
}: {
  value: number;
  className?: string;
  format: (value: number) => string;
}) {
  const prev = useRef<number | null>(null);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    if (prev.current == null || Number.isNaN(value)) {
      prev.current = value;
      return;
    }
    if (Math.abs(value - prev.current) < 0.0001) return;
    setFlash(value > prev.current ? "metric-up" : "metric-down");
    prev.current = value;
    const timer = window.setTimeout(() => setFlash(""), 700);
    return () => window.clearTimeout(timer);
  }, [value]);

  return <span className={`${className} ${flash}`.trim()}>{format(value)}</span>;
}

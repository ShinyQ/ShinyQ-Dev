"use client";

import { useEffect, useState } from "react";

/**
 * Delays propagating a fast-changing value until it settles for `delay` ms.
 * Primary use: debounce search input before triggering a network request.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

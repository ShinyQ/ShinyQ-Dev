"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { toast } from "@/hooks/use-toast";
import type { ActionResult } from "@/lib/actions/action-result";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ListResult<T> {
  items: T[];
  total: number;
}

/**
 * Serialisable filter bag passed to the fetch action alongside page/pageSize.
 * Consumers narrow this via generics:
 *   useTableData<Project, { search?: string }>({ ... })
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type FilterBag = {};

export interface UseTableDataOptions<T, F extends FilterBag = FilterBag> {
  /** Server action (or wrapper) that returns a paginated list. */
  fetchAction: (
    params: { page: number; pageSize: number } & F,
  ) => Promise<ActionResult<ListResult<T>>>;

  /** Default page size — should be 10 everywhere per standard. */
  defaultPageSize?: number;

  /**
   * Current filter values.  When any value changes the hook automatically
   * resets to page 1 and re-fetches.
   */
  filters?: F;

  /** Increment to force a refetch from the parent (e.g. after create/delete). */
  refreshKey?: number;

  /** Toast title shown on fetch error (defaults to "Failed to load data"). */
  errorTitle?: string;
}

export interface UseTableDataReturn<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  /** True while the first or subsequent fetch is in flight. */
  loading: boolean;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

const DEFAULT_PAGE_SIZE = 10;

export function useTableData<T, F extends FilterBag = FilterBag>({
  fetchAction,
  defaultPageSize = DEFAULT_PAGE_SIZE,
  filters,
  refreshKey = 0,
  errorTitle = "Failed to load data",
}: UseTableDataOptions<T, F>): UseTableDataReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeRaw] = useState(defaultPageSize);
  const [loading, startTransition] = useTransition();

  // Track previous filter JSON to reset page on change
  const filterJson = JSON.stringify(filters ?? {});
  const prevFilterRef = useRef(filterJson);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (prevFilterRef.current !== filterJson) {
      prevFilterRef.current = filterJson;
      setPage(1);
    }
  }, [filterJson]);

  const fetchData = useCallback(() => {
    startTransition(async () => {
      const params = { page, pageSize, ...(filters as F) };
      const result = await fetchAction(params);
      if (result.ok) {
        setItems(result.data.items);
        setTotal(result.data.total);
      } else {
        toast({
          variant: "destructive",
          title: errorTitle,
          description: result.error.message,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filterJson, refreshKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function setPageSize(size: number) {
    setPageSizeRaw(size);
    setPage(1);
  }

  return { items, total, page, pageSize, loading, setPage, setPageSize };
}

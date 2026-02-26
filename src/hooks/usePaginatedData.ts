import { useState, useCallback, useRef, useEffect } from "react";

interface PaginationParams {
  limit?: number;
  lastId?: string;
  search?: string;
}

interface PaginationResponse<T> {
  data: T[];
  pagination?: {
    hasMore: boolean;
    lastId: string | null;
    limit: number;
    count: number;
  };
}

interface UsePaginatedDataOptions<T> {
  fetchFunction: (uid: string, params: PaginationParams) => Promise<PaginationResponse<T> | T[]>;
  initialPageSize?: number;
  uid?: string;
  activeTab?: string;
  tabName?: string;
  enabled?: boolean;
}

interface UsePaginatedDataReturn<T> {
  data: T[];
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refresh: () => void;
}

export function usePaginatedData<T extends { id: string }>({
  fetchFunction,
  initialPageSize = 3,
  uid,
  activeTab,
  tabName,
  enabled = true,
}: UsePaginatedDataOptions<T>): UsePaginatedDataReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageHistory, setPageHistory] = useState<Map<number, string | null>>(
    new Map([[1, null]])
  );
  const [searchQuery, setSearchQuery] = useState("");
  const pageHistoryRef = useRef<Map<number, string | null>>(new Map([[1, null]]));
  const isInitialMount = useRef(true);

  useEffect(() => {
    pageHistoryRef.current = pageHistory;
  }, [pageHistory]);

  const loadData = useCallback(
    async (page: number, size: number, resetHistory = false, currentSearch?: string) => {
      if (!uid || !enabled) {
        setIsLoading(false);
        setData([]);
        return;
      }

      if (tabName && activeTab !== tabName) {
        return;
      }

      try {
        setIsLoading(true);

        if (resetHistory) {
          setPageHistory(new Map([[1, null]]));
        }

        let lastIdForPage: string | null = null;
        if (page > 1 && !currentSearch) {
          lastIdForPage = pageHistoryRef.current.get(page - 1) || null;

          if (!lastIdForPage && page > 1) {
            let currentLastId: string | null = null;
            for (let p = 1; p < page; p++) {
              const params: PaginationParams = { limit: size };
              if (currentLastId) {
                params.lastId = currentLastId;
              }
              const response = await fetchFunction(uid, params);
              
              if ("data" in response && response.data && response.data.length > 0) {
                currentLastId = response.pagination?.lastId || null;
                setPageHistory((prev) => {
                  const newMap = new Map(prev);
                  newMap.set(p + 1, currentLastId);
                  return newMap;
                });
              } else {
                break;
              }
            }
            lastIdForPage = currentLastId;
          }
        }

        const params: PaginationParams = { limit: size };
        if (lastIdForPage && !currentSearch) {
          params.lastId = lastIdForPage;
        }
        if (currentSearch && currentSearch.trim()) {
          params.search = currentSearch.trim();
        }

        const response = await fetchFunction(uid, params);

        let dataArray: T[] = [];
        
        if ("data" in response && response.data) {
          dataArray = response.data;
          const newLastId = response.pagination?.lastId || null;

          setPageHistory((prev) => {
            const newMap = new Map(prev);
            newMap.set(page, newLastId);
            if (page === 1) {
              newMap.set(1, null);
            }
            return newMap;
          });

          if (response.pagination?.hasMore) {
            setTotalPages((prev) => Math.max(prev, page + 1));
          } else {
            setTotalPages(page);
          }

          setTotalCount((page - 1) * size + dataArray.length);
        } else if (Array.isArray(response)) {
          dataArray = response;
          setTotalPages(1);
          setTotalCount(dataArray.length);
        }

        const uniqueData = dataArray.filter(
          (item, index, self) => index === self.findIndex((i) => i.id === item.id)
        );

        setData(uniqueData);
      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    },
    [uid, fetchFunction, enabled, tabName, activeTab]
  );

  useEffect(() => {
    if (!enabled || !uid) {
      setIsLoading(false);
      setData([]);
      return;
    }

    if (tabName && activeTab !== tabName) {
      return;
    }

    loadData(currentPage, pageSize, currentPage === 1, searchQuery);
    isInitialMount.current = false;
  }, [uid, currentPage, pageSize, enabled, activeTab, tabName, loadData, searchQuery]);

  useEffect(() => {
    if (!isInitialMount.current && uid && enabled) {
      if (tabName && activeTab !== tabName) {
        return;
      }
      setCurrentPage(1);
      loadData(1, pageSize, true, searchQuery);
    }
  }, [searchQuery, loadData, pageSize, uid, enabled, tabName, activeTab]);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const setPageSize = useCallback(
    (size: number) => {
      setPageSizeState(size);
      setCurrentPage(1);
      loadData(1, size, true);
    },
    [loadData]
  );

  const refresh = useCallback(() => {
    loadData(currentPage, pageSize, false, searchQuery);
  }, [loadData, currentPage, pageSize, searchQuery]);

  return {
    data,
    isLoading,
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    searchQuery,
    setSearchQuery,
    goToPage,
    setPageSize,
    refresh,
  };
}

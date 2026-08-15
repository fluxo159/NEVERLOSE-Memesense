import { useState, useMemo } from 'react';

export function usePagination<T>(items: T[], itemsPerPage: number = 20) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  // Ensure current page is valid when items length changes (e.g. filtering)
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedItems = useMemo(() => {
    const start = (validCurrentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, validCurrentPage, itemsPerPage]);

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToPage = (page: number) => setCurrentPage(Math.min(Math.max(1, page), totalPages));

  return {
    currentPage: validCurrentPage,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage,
    goToPage,
    setCurrentPage
  };
}

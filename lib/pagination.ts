export const PAGE_SIZES = [10, 20, 30, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 10;

export function parsePage(value?: string) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export function parsePageSize(value?: string) {
  const n = Number(value);
  return (PAGE_SIZES as readonly number[]).includes(n) ? n : DEFAULT_PAGE_SIZE;
}

export function paginationFromSearch(search: { page?: string; pageSize?: string }) {
  const pageSize = parsePageSize(search.pageSize);
  const page = parsePage(search.page);
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function paginationMeta(total: number, page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const current = Math.min(Math.max(page, 1), totalPages);
  return {
    total,
    page: current,
    pageSize,
    totalPages,
    skip: (current - 1) * pageSize,
    take: pageSize,
  };
}

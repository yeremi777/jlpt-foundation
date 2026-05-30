export interface PaginationParams {
  readonly page: number;
  readonly size: number;
}

export interface PaginationMeta {
  readonly currentPage: number;
  readonly lastPage: number;
  readonly size: number;
  readonly from: number | null;
  readonly to: number | null;
  readonly total: number;
}

export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly paginate: PaginationMeta;
}

export function paginateItems<T>(
  items: readonly T[],
  params: PaginationParams,
): PaginatedResult<T> {
  const total = items.length;
  const lastPage = total > 0 ? Math.ceil(total / params.size) : 1;
  const offset = (params.page - 1) * params.size;
  const paginatedItems = items.slice(offset, offset + params.size);

  return {
    items: paginatedItems,
    paginate: {
      currentPage: params.page,
      lastPage,
      size: params.size,
      from: params.page <= lastPage ? (total !== 0 ? offset + 1 : 0) : null,
      to:
        params.page < lastPage
          ? params.page * params.size
          : params.page > lastPage
            ? null
            : total,
      total,
    },
  };
}

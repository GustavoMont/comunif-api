interface ListDto<T> {
  results: T[];
  meta: {
    total: number;
    page: number;
    pageCount: number;
    pages: number;
  };
}

export class ListResponse<T> implements ListDto<T> {
  constructor(list: T[], total: number, page: number, take: number) {
    this.results = list;

    this.meta = {
      total,
      page,
      pageCount: list.length,
      pages: Math.ceil(total / take) || 1,
    };
  }
  results: T[];
  meta: {
    total: number;
    page: number;
    pageCount: number;
    pages: number;
  };
}

export class ListResponse<T> {
  constructor(list: T[], total: number, page: number, take: number) {
    this.results = list;

    this.meta = {
      total,
      page,
      pageCount: list.length,
      pages: Math.round(total / take),
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

export function paginateResponse(
  data: [any, number],
  currentPage: number,
  limit: number,
) {
  const [result, total] = data;
  const lastPage = Math.ceil(total / limit);
  const nextPage = currentPage + 1 > lastPage ? null : currentPage + 1;
  const prevPage = currentPage - 1 < 1 ? null : currentPage - 1;

  return {
    data: [...result],
    total,
    currentPage,
    nextPage,
    prevPage,
    lastPage,
  };
}

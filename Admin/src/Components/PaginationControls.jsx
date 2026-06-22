export default function PaginationControls({
  isLoading,
  onPageChange,
  pagination,
}) {
  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalResults = pagination?.totalResults || 0;
  const limit = pagination?.limit || 10;
  const startResult = totalResults === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endResult = Math.min(currentPage * limit, totalResults);

  return (
    <div className="paginationControls">
      <p>
        Showing {startResult}-{endResult} of {totalResults}
      </p>
      <div>
        <button
          type="button"
          className="secondaryButton"
          disabled={isLoading || currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          className="secondaryButton"
          disabled={isLoading || currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

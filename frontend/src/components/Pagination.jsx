function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
      <button
        className="btn btn-sm btn-outline-secondary"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span className="text-muted">
        Page {page} of {totalPages}
      </span>
      <button
        className="btn btn-sm btn-outline-secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;

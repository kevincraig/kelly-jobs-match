import React from 'react';

const PaginationControls = ({ page, pageSize, onPrev, onNext, onPageSizeChange, hasNext, hasPrev }) => (
  <div className="flex justify-center items-center space-x-4 mt-4">
    <button onClick={onPrev} disabled={!hasPrev} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50">Prev</button>
    <span>Page {page}</span>
    <button onClick={onNext} disabled={!hasNext} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50">Next</button>
    <select value={pageSize} onChange={onPageSizeChange} className="ml-4 px-2 py-1 rounded border">
      {[10, 20, 50].map(size => (
        <option key={size} value={size}>{size} per page</option>
      ))}
    </select>
  </div>
);

export default PaginationControls; 
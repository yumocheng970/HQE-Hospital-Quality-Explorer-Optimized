/**
 * Placeholder shown when a query returns no results.
 * @param {string} [title="No results found"] - Main heading
 * @param {string} [message="Try adjusting your filters."] - Helper text
 */
export default function EmptyState({
  title = 'No results found',
  message = 'Try adjusting your filters.',
}) {
  return (
    <div className="text-gray-500 text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
      <p className="text-lg font-medium">{title}</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
  );
}
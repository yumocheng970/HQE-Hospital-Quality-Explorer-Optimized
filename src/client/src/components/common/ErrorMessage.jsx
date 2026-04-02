/**
 * Error message banner displayed when a request fails.
 * @param {string} message - Error description to show the user
 */
export default function ErrorMessage({ message }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-6 py-4 text-center">
      <p className="font-semibold">Something went wrong</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
  );
}
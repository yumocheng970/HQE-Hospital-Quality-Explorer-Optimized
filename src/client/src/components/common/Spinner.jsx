/**
 * Loading spinner displayed while data is being fetched.
 * @param {string} [message="Loading..."] - Optional text shown below the spinner
 */
export default function Spinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      <p className="mt-4 text-sm">{message}</p>
    </div>
  );
}
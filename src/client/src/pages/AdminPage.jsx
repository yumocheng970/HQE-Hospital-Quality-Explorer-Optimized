import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useFetch from '../hooks/useFetch';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deleteError, setDeleteError] = useState(null);
  const [deletedIds, setDeletedIds] = useState([]);

  const { data: users, loading, error } = useFetch('/api/admin/users');

  // Redirect non-admins
  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const handleDelete = async (id, username) => {
    if (!confirm(`Delete user "${username}"?`)) return;
    setDeleteError(null);

    try {
      const res = await fetch(`http://localhost:3001/api/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setDeletedIds((prev) => [...prev, id]);
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  const visibleUsers = Array.isArray(users)
    ? users.filter((u) => !deletedIds.includes(u.id))
    : [];

  return (
    <div className="max-w-3xl mx-auto p-8">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-500 mt-2">Manage user accounts.</p>
          <Link to="/" className="text-blue-600 hover:underline text-sm">
            ← Back to Search
          </Link>
        </div>
        <div className="text-sm text-right flex items-center gap-3">
          <span className="text-gray-600">
            {user.username}
            <span className="ml-1 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded">
              Admin
            </span>
          </span>
          <button onClick={logout} className="text-red-600 hover:underline">
            Sign out
          </button>
        </div>
      </header>

      {loading ? (
        <Spinner message="Loading users..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {deleteError && (
            <div className="px-6 py-3 bg-red-50 text-red-700 text-sm border-b border-red-100">
              {deleteError}
            </div>
          )}
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">ID</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Username</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Role</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-6 py-4 text-gray-500">{u.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{u.username}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      u.role === 'admin'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(u.id, u.username)}
                      disabled={u.id === user.id}
                      className={`text-xs font-medium px-3 py-1 rounded ${
                        u.id === user.id
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import useFetch from '../hooks/useFetch';
import useAuth from '../hooks/useAuth';
import HospitalCard from '../components/common/HospitalCard';

export default function SearchPage() {
  // URL-driven search: searchParams is the single source of truth
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();

  // Local states for form inputs
  const [searchName, setSearchName] = useState(searchParams.get('name') || '');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');

  // Fetch the list of states for the dropdown
  const { data: statesData } = useFetch('/api/hospitals/states');
  const statesList = statesData?.data || [];

  // Build API path from URL search params (null = skip request)
  const searchQuery = searchParams.toString();
  const searchPath = searchQuery ? `/api/hospitals?${searchQuery}` : null;

  // Fetch search results (auto-triggers when searchParams change)
  const { data: hospitals, loading, error } = useFetch(searchPath);

  // Derived state from URL
  const nameParam = searchParams.get('name');
  const stateParam = searchParams.get('state');
  const hasSearched = nameParam || stateParam;

  // Sync input fields when URL changes (browser back/forward)
  useEffect(() => {
    setSearchName(nameParam || '');
    setSelectedState(stateParam || '');
  }, [nameParam, stateParam]);

  // Update URL on search — this triggers useFetch via searchPath change
  const handleSearch = () => {
    const params = {};
    if (searchName) params.name = searchName;
    if (selectedState) params.state = selectedState;
    setSearchParams(params);
  };

  // Download filtered results as CSV (requires login)
  const handleExportCSV = async () => {
    const query = searchParams.toString();
    const url = `http://localhost:3001/api/export/csv${query ? `?${query}` : ''}`;

    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'hospitals.csv';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      alert('Failed to export CSV. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Hospital Quality Explorer</h1>
          <p className="text-gray-500 mt-2">Find and compare hospitals across the United States.</p>
          <div className="flex gap-4 mt-1">
            <Link to="/query" className="text-blue-600 hover:underline text-sm">
              Try natural language search →
            </Link>
            <Link to="/dashboard" className="text-blue-600 hover:underline text-sm">
              View dashboard →
            </Link>
            <Link to="/map" className="text-blue-600 hover:underline text-sm">
              View map →
            </Link>
          </div>
        </div>
        <div className="text-sm text-right">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-600">
                {user.username}
                {user.role === 'admin' && (
                  <span className="ml-1 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </span>
              <button onClick={logout} className="text-red-600 hover:underline">
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* Search Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 mb-8">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name (e.g., General)..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <select
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
        >
          <option value="">All States</option>
          {statesList.map((s) => (
            <option key={s.state} value={s.state}>
              {s.state} ({s.count} hospitals)
            </option>
          ))}
        </select>

        <button
          className={`${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} 
            text-white font-semibold px-8 py-2 rounded-lg transition-colors min-w-[120px]`}
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>

        {user && hasSearched && (
          <button
            onClick={handleExportCSV}
            className="border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Export CSV
          </button>
        )}
      </div>

      {/* Results */}
      <main>
        {loading ? (
          <Spinner message="Searching hospitals..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : !hasSearched ? (
          <EmptyState
            title="Ready to explore?"
            message="Enter a hospital name or select a state to begin your search."
          />
        ) : !hospitals || hospitals.length === 0 ? (
          <EmptyState message="Try adjusting your filters or check your spelling." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hospitals.map((hospital) => (
              <HospitalCard key={hospital.facility_id} hospital={hospital} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
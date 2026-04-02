import { useState } from 'react';
import QueryBar from '../components/QueryBar';
import parseQuery from '../utils/parseQuery';
import useFetch from '../hooks/useFetch';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import HospitalCard from '../components/common/HospitalCard';

export default function QueryPage() {
  const [queryParams, setQueryParams] = useState(null);
  const [matched, setMatched] = useState([]);

  // Build URL only when queryParams is set
  const url = queryParams
    ? `/api/hospitals?${new URLSearchParams(queryParams).toString()}`
    : null;

  const { data, loading, error } = useFetch(url);

  const handleSearch = (text) => {
    const parsed = parseQuery(text);
    const { _matched, ...params } = parsed;
    setMatched(_matched);
    setQueryParams(params);
  };

  return (
    <div className="query-page">
      <h1>Find a Hospital</h1>
      <QueryBar onSearch={handleSearch} />

      {matched.length > 0 && (
        <p className="query-matched">
          Understood: {matched.join(', ')}
        </p>
      )}

      {loading && <Spinner />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && data && data.length === 0 && (
        <EmptyState message="No hospitals matched. Try different criteria." />
      )}

      {!loading && !error && data && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((h) => (
            <HospitalCard key={h.facility_id} hospital={h} />
          ))}
        </div>
      )}
    </div>
  );
}
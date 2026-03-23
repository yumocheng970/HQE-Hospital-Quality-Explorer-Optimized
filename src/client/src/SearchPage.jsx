import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function SearchPage() {
  // --- 1. Routing & State Management ---
  // useSearchParams synchronizes the UI state with the browser's URL
  const [searchParams, setSearchParams] = useSearchParams();

  // Local states for form inputs (initialized from URL if present)
  const [searchName, setSearchName] = useState(searchParams.get('name') || '');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
  
  // Data states
  const [statesList, setStatesList] = useState([]); // Dropdown options
  const [hospitals, setHospitals] = useState([]);   // Search results
  
  // UI status states
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(searchParams.has('name') || searchParams.has('state'));

  // --- 2. Initial Data Fetch ---
  // Fetch the list of states and hospital counts on component mount
  useEffect(() => {
    fetch('http://localhost:3001/api/hospitals/states')
      .then((res) => res.json())
      .then((json) => setStatesList(json.data || []))
      .catch((err) => console.error('Failed to fetch states:', err));
  }, []);

  // --- 3. Reactive Search Logic ---
  // This effect runs whenever the URL parameters change (e.g., clicking Search or Back button)
  useEffect(() => {
    const nameParam = searchParams.get('name');
    const stateParam = searchParams.get('state');

    // If there are no search parameters, reset results and stop
    if (!nameParam && !stateParam) {
      setHospitals([]);
      return;
    }

    // Update UI to reflect the search in progress
    setIsSearching(true);
    setHasSearched(true);
    
    // Sync local input state with URL (crucial for browser Back/Forward navigation)
    setSearchName(nameParam || '');
    setSelectedState(stateParam || '');

    // Construct the API query
    const fetchParams = new URLSearchParams();
    if (nameParam) fetchParams.append('name', nameParam);
    if (stateParam) fetchParams.append('state', stateParam);

    // Fetch filtered hospitals from the backend (Node.js/Express)
    fetch(`http://localhost:3001/api/hospitals?${fetchParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setHospitals(data); // Backend logic typically limits this to 50 results
        setIsSearching(false);
      })
      .catch((err) => {
        console.error('Search API error:', err);
        setIsSearching(false);
      });
  }, [searchParams]); // Re-run whenever the URL search string changes

  // --- 4. Event Handlers ---
  const handleSearch = () => {
    // Instead of fetching directly, we update the URL. 
    // This triggers the useEffect above to perform the actual search.
    const params = {};
    if (searchName) params.name = searchName;
    if (selectedState) params.state = selectedState;
    
    setSearchParams(params); 
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Hospital Quality Explorer</h1>
        <p className="text-gray-500 mt-2">Find and compare hospitals across the United States.</p>
      </header>

      {/* --- Search Section --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 mb-8">
        {/* Hospital Name Input */}
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

        {/* State Filter Dropdown */}
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

        {/* Action Button */}
        <button
          className={`${isSearching ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} 
            text-white font-semibold px-8 py-2 rounded-lg transition-colors min-w-[120px]`}
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* --- Results Section --- */}
      <main>
        {!hasSearched ? (
          /* Initial State: User hasn't searched yet */
          <div className="text-gray-500 text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <p className="text-lg font-medium">Ready to explore?</p>
            <p className="text-sm">Enter a hospital name or select a state to begin your search.</p>
          </div>
        ) : hospitals.length === 0 ? (
          /* Empty State: Search returned no results */
          <div className="text-gray-500 text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <p className="text-lg font-medium">No results found.</p>
            <p className="text-sm">Try adjusting your filters or check your spelling.</p>
          </div>
        ) : (
          /* Data State: Displaying list of hospitals in a responsive grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hospitals.map((hospital) => (
              <Link
                key={hospital.facility_id}
                to={`/hospital/${hospital.facility_id}`}
                className="group block bg-white shadow-sm hover:shadow-md transition-all rounded-lg p-6 border border-gray-200 hover:border-blue-300"
              >
                <h2 className="text-xl font-bold text-blue-600 mb-2 truncate group-hover:text-blue-700">
                  {hospital.facility_name}
                </h2>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>📍 {hospital.address}, {hospital.city_town}, {hospital.state} {hospital.zip_code}</p>
                  <p>📞 {hospital.telephone_number}</p>
                </div>
                
                {/* Hospital Tags & Metrics */}
                <div className="flex gap-2 mt-4">
                  <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-bold border border-blue-100">
                    Rating: {hospital.hospital_overall_rating === 'Not Available' ? 'N/A' : `${hospital.hospital_overall_rating} Stars`}
                  </span>
                  <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold border border-green-100 truncate">
                    {hospital.hospital_type}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
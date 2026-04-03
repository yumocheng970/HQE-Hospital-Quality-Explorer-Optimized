import { Link, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';

export default function HospitalDetailPage() {
  const { id } = useParams();
  const { data: hospital, loading, error } = useFetch(`/api/hospitals/${id}`);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Search
        </Link>
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <Spinner message="Loading hospital details..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Search
        </Link>
        <div className="mt-6">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Search
        </Link>
        <div className="mt-6">
          <EmptyState
            title="No hospital data"
            message="This hospital record could not be loaded."
          />
        </div>
      </div>
    );
  }

  const rating =
    hospital.hospital_overall_rating === 'Not Available'
      ? 'N/A'
      : `${hospital.hospital_overall_rating} Stars`;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
        ← Back to Search
      </Link>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {hospital.facility_name}
            </h1>
            <p className="mt-2 text-gray-600">
              {hospital.address}, {hospital.city_town}, {hospital.state} {hospital.zip_code}
            </p>
            <p className="mt-1 text-gray-600">{hospital.telephone_number || 'N/A'}</p>
          </div>

          <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 border border-blue-100">
            Overall Rating: {rating}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Quality Summary</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <SummaryCard
              title="Mortality Measures"
              better={hospital.count_of_mort_measures_better}
              same={hospital.count_of_mort_measures_no_different}
              worse={hospital.count_of_mort_measures_worse}
            />
            <SummaryCard
              title="Safety Measures"
              better={hospital.count_of_safety_measures_better}
              same={hospital.count_of_safety_measures_no_different}
              worse={hospital.count_of_safety_measures_worse}
            />
            <SummaryCard
              title="Readmission Measures"
              better={hospital.count_of_readm_measures_better}
              same={hospital.count_of_readm_measures_no_different}
              worse={hospital.count_of_readm_measures_worse}
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoCard label="Hospital Type" value={hospital.hospital_type} />
          <InfoCard label="Ownership" value={hospital.hospital_ownership} />
          <InfoCard label="Emergency Services" value={hospital.emergency_services} />
          <InfoCard
            label="Birthing Friendly"
            value={hospital.meets_criteria_for_birthing_friendly_designation}
          />
          <InfoCard label="County" value={hospital.county_parish} />
          <InfoCard label="Facility ID" value={hospital.facility_id} />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-gray-900 font-semibold">{value || 'N/A'}</p>
    </div>
  );
}

function SummaryCard({ title, better, same, worse }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="mt-3 space-y-2 text-sm text-gray-700">
        <p>
          <span className="font-medium text-green-700">Better:</span> {better || '0'}
        </p>
        <p>
          <span className="font-medium text-gray-700">No Different:</span> {same || '0'}
        </p>
        <p>
          <span className="font-medium text-red-700">Worse:</span> {worse || '0'}
        </p>
      </div>
    </div>
  );
}
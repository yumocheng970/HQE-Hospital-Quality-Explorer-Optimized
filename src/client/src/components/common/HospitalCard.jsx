import { Link } from 'react-router-dom';

export default function HospitalCard({ hospital }) {
  const h = hospital;
  const rating = h.hospital_overall_rating === 'Not Available'
    ? 'N/A'
    : `${h.hospital_overall_rating} Stars`;

  return (
    <Link
      to={`/hospital/${h.facility_id}`}
      className="group block bg-white shadow-sm hover:shadow-md transition-all rounded-lg p-6 border border-gray-200 hover:border-blue-300"
    >
      <h2 className="text-xl font-bold text-blue-600 mb-2 truncate group-hover:text-blue-700">
        {h.facility_name}
      </h2>
      <div className="space-y-1 text-sm text-gray-600">
        <p>📍 {h.address}, {h.city_town}, {h.state} {h.zip_code}</p>
        <p>📞 {h.telephone_number}</p>
      </div>
      <div className="flex gap-2 mt-4">
        <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-bold border border-blue-100">
          Rating: {rating}
        </span>
        <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold border border-green-100 truncate">
          {h.hospital_type}
        </span>
      </div>
    </Link>
  );
}
const MOCK_HOSPITAL = {
  facility_id: "1",
  name: "Maine Medical Center",
  city: "Portland",
  state: "ME",
  overall_rating: 4,
  type: "Acute Care",
  ownership: "Voluntary non-profit"
}

export default function HospitalDetailPage() {
  return (
    <div>
      <h1>{MOCK_HOSPITAL.name}</h1>
      <p>{MOCK_HOSPITAL.city}, {MOCK_HOSPITAL.state}</p>
      <p>Rating: {MOCK_HOSPITAL.overall_rating}</p>
    </div>
  )
}

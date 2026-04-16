import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet.markercluster";

import useFetch from "../hooks/useFetch";
import Spinner from "../components/common/Spinner";
import ErrorMessage from "../components/common/ErrorMessage";
import EmptyState from "../components/common/EmptyState";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function getRatingColor(rating) {
  switch (String(rating)) {
    case "5":
      return "#16a34a";
    case "4":
      return "#65a30d";
    case "3":
      return "#ca8a04";
    case "2":
      return "#ea580c";
    case "1":
      return "#dc2626";
    default:
      return "#6b7280";
  }
}

function makeCircleIcon(rating) {
  const color = getRatingColor(rating);
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 18px;
        height: 18px;
        border-radius: 9999px;
        background: ${color};
        border: 2px solid white;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.15);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -8],
  });
}

export default function MapPage() {
  const { data: statesData } = useFetch("/api/hospitals/states");
  const [selectedState, setSelectedState] = useState("MA");

  const { data: hospitals, loading, error } = useFetch(
    `/api/hospitals?state=${selectedState}`
  );

  const statesList = statesData?.data || [];
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerLayerRef = useRef(null);

  const validHospitals = useMemo(() => {
    if (!Array.isArray(hospitals)) return [];
    return hospitals.filter(
      (h) =>
        h.lat !== null &&
        h.lat !== undefined &&
        h.lon !== null &&
        h.lon !== undefined &&
        !Number.isNaN(Number(h.lat)) &&
        !Number.isNaN(Number(h.lon))
    );
  }, [hospitals]);

    useEffect(() => {
    if (loading) return;
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([42.3601, -71.0589], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const clusterGroup = L.markerClusterGroup();
    map.addLayer(clusterGroup);

    mapInstanceRef.current = map;
    markerLayerRef.current = clusterGroup;

    return () => {
        if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        }
        markerLayerRef.current = null;
    };
    }, [loading]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerLayerRef.current) return;

    const clusterGroup = markerLayerRef.current;
    clusterGroup.clearLayers();

    if (!validHospitals.length) return;

    const bounds = [];

    validHospitals.forEach((hospital) => {
      const lat = Number(hospital.lat);
      const lon = Number(hospital.lon);

      const marker = L.marker([lat, lon], {
        icon: makeCircleIcon(hospital.hospital_overall_rating),
      });

      marker.bindPopup(`
        <div style="min-width: 220px;">
          <div style="font-weight: 700; margin-bottom: 6px;">
            ${hospital.facility_name}
          </div>
          <div style="font-size: 14px; margin-bottom: 4px;">
            Rating: ${hospital.hospital_overall_rating || "N/A"}
          </div>
          <div style="font-size: 14px; margin-bottom: 8px;">
            ${hospital.city_town}, ${hospital.state}
          </div>
          <a href="/hospital/${hospital.facility_id}" style="color: #2563eb; text-decoration: underline;">
            View details
          </a>
        </div>
      `);

      clusterGroup.addLayer(marker);
      bounds.push([lat, lon]);
    });

    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [validHospitals]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-800">Hospital Map</h1>
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <Spinner message="Loading map data..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-800">Hospital Map</h1>
        <div className="mt-6">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Hospital Map</h1>
        <p className="mt-2 text-gray-500">
          Explore hospitals geographically and compare ratings by marker color.
        </p>
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          ← Back to Search
        </Link>
      </header>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label
          htmlFor="state-select"
          className="mr-2 text-sm font-medium text-gray-700"
        >
          State:
        </label>
        <select
          id="state-select"
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        >
          {statesList.map((s) => (
            <option key={s.state} value={s.state}>
              {s.state} ({s.count} hospitals)
            </option>
          ))}
        </select>
      </div>

      {!Array.isArray(hospitals) || hospitals.length === 0 ? (
        <EmptyState
          title="No hospitals found"
          message="Try a different state filter."
        />
      ) : validHospitals.length === 0 ? (
        <EmptyState
          title="No map coordinates available"
          message="Current hospital data does not include latitude/longitude yet."
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div ref={mapRef} className="h-[600px] w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
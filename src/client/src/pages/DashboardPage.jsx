import { useState, useEffect, useRef } from "react";
import * as Plot from "@observablehq/plot";
import useFetch from "../hooks/useFetch";
import Spinner from "../components/common/Spinner";
import ErrorMessage from "../components/common/ErrorMessage";
import EmptyState from "../components/common/EmptyState";
import { Link } from 'react-router-dom';

export default function DashboardPage() {
    // data: array from API, e.g. [{ state: "CA", rating: "3", count: 10 }, ...]
    // loading: true while request is in flight, false when done
    // error: error message string if request failed, otherwise null
    const { data, loading, error } = useFetch("/api/stats/ratings-by-state");

    // Currently selected state, defaults to "ALL" (nationwide)
    const [selectedState, setSelectedState] = useState("ALL");

    // useRef creates a DOM reference pointing to the empty div below
    // Starts as null; React sets chartRef.current to the DOM element after render
    // Used because Observable Plot generates raw DOM nodes, not React components
    const chartRef = useRef(null);
    const typeChartRef = useRef(null);

    // ── Hospital Type Distribution ──
    // Backend endpoint: GET /api/stats/types-by-state
    // Expected response: [{ state, hospital_type, count }, ...]
    const { data: typeData } = useFetch("/api/stats/types-by-state");

    // Extract unique state names from data, prepend "ALL", sort alphabetically
    // new Set() removes duplicates, ... spreads it into an array
    const states = data
        ? ["ALL", ...new Set(data.map((d) => d.state))].sort()
        : [];

    // Filter data based on selected state
    // data?.filter uses optional chaining to avoid error when data is null
    // If "ALL" is selected, return all data; otherwise keep only the selected state
    const filtered =
        data && selectedState === "ALL"
            ? data
            : data?.filter((d) => d.state === selectedState);

    // Shared chart-building logic to avoid duplicate code
    // chartData: array of data to plot, title: chart title string
    function buildChart(chartData, title) {
        return Plot.plot({
            title,
            width: 700,
            height: 400,
            x: { label: "Rating", type: "band" },
            y: { label: "Number of Hospitals", grid: true },
            marks: [
                Plot.barY(chartData, {
                    x: (d) => `${d.rating} ⭐`,
                    y: "count",
                    fill: "steelblue",
                    tip: true, // show value on hover
                }),
                Plot.ruleY([0]), // baseline on X axis
            ],
        });
    }

    // Redraw chart when filtered data or selected state changes
    useEffect(() => {
        // Safety check: skip if data isn't ready or div isn't mounted yet
        if (!filtered || !chartRef.current) return;

        // Clear previous chart
        chartRef.current.innerHTML = "";

        // Default to filtered data (single state — each rating is already one row, no merging needed)
        let chartData = filtered;
        let title = `Hospital Ratings — ${selectedState}`;

        // When "ALL" is selected, the same rating appears once per state,
        // so we use reduce to aggregate counts by rating across all states
        if (selectedState === "ALL") {
            chartData = Object.values(
                // reduce: iterate array, use acc (accumulator) to group by rating and sum counts
                // Starts with {} empty object, ends up as { "1": {rating, count}, "2": {rating, count}, ... }
                filtered.reduce((acc, d) => {
                    const r = d.rating;
                    if (!acc[r]) acc[r] = { rating: r, count: 0 };
                    acc[r].count += d.count;
                    return acc;
                }, {})
            ).sort((a, b) => a.rating - b.rating); // sort by rating ascending
            title = "Hospital Ratings — All States";
        }

        const plot = buildChart(chartData, title);
        chartRef.current.appendChild(plot);

        // Cleanup: remove old chart when component unmounts or before next effect runs
        return () => plot.remove();
    }, [filtered, selectedState]);

    // ── Hospital Type chart: filter + aggregate + render ──
    const filteredTypes =
        typeData && selectedState === "ALL"
            ? typeData
            : typeData?.filter((d) => d.state === selectedState);

    useEffect(() => {
        if (!filteredTypes || !typeChartRef.current) return;
        typeChartRef.current.innerHTML = "";

        // Aggregate counts by hospital_type (needed when "ALL" is selected)
        const chartData = Object.values(
            filteredTypes.reduce((acc, d) => {
                const t = d.hospital_type;
                if (!acc[t]) acc[t] = { hospital_type: t, count: 0 };
                acc[t].count += d.count;
                return acc;
            }, {})
        ).sort((a, b) => b.count - a.count); // sort descending by count

        const title =
            selectedState === "ALL"
                ? "Hospital Types — All States"
                : `Hospital Types — ${selectedState}`;

        const plot = Plot.plot({
            title,
            width: 700,
            height: 400,
            marginLeft: 180, // room for long type labels
            x: { label: "Number of Hospitals", grid: true },
            y: { label: null, type: "band" },
            marks: [
                Plot.barX(chartData, {
                    x: "count",
                    y: "hospital_type",
                    fill: "#e07a5f",
                    tip: true,
                }),
                Plot.ruleX([0]),
            ],
        });

        typeChartRef.current.appendChild(plot);
        return () => plot.remove();
    }, [filteredTypes, selectedState]);

    // Render in order: loading → error → empty → normal content
    if (loading) return <Spinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!data || data.length === 0) return <EmptyState />;

    return (
        <div className="max-w-5xl mx-auto p-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500 mt-2">Hospital ratings breakdown by state.</p>
                <Link to="/" className="text-blue-600 hover:underline text-sm">
                    ← Back to Search
                </Link>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <label htmlFor="state-select" className="text-sm font-medium text-gray-700 mr-2">
                    State:
                </label>
                <select
                    id="state-select"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    {states.map((s) => (
                        <option key={s} value={s}>
                            {s === "ALL" ? "All States" : s}
                        </option>
                    ))}
                </select>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div ref={chartRef} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
                <div ref={typeChartRef} />
            </div>
        </div>
    );
}
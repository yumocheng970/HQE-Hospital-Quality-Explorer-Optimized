/**
 * parseQuery - extract hospital search params from natural language
 *
 * Examples:
 *   "hospitals in CA with 5 stars"       -> { state: "CA", rating: "5" }
 *   "critical access hospitals in Maine"  -> { state: "ME", type: "Critical Access Hospitals" }
 *   "hospitals in Portland Oregon"        -> { city: "Portland", state: "OR" }
 *
 * Returns: { state?, city?, rating?, type?, name? }
 */

const STATE_MAP = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
  'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
  'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
  'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM',
  'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND',
  'ohio': 'OH', 'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA',
  'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD',
  'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
  'wisconsin': 'WI', 'wyoming': 'WY',
};

// Reverse lookup: abbreviation set for quick validation
const VALID_ABBRS = new Set(Object.values(STATE_MAP));

// Hospital type keywords -> API value
const TYPE_MAP = {
  'critical access': 'Critical Access Hospitals',
  'acute care':      'Acute Care Hospitals',
  'childrens':       "Children's",
  "children's":      "Children's",
  'psychiatric':     'Psychiatric',
  'va ':             'Department of Defense',
  'dod':             'Department of Defense',
  'tribal':          'Tribal',
};

function extractRating(input) {
  // "5 stars", "rated 4", "rating 3", "4-star"
  const m = input.match(/(\d)\s*[-\s]?\s*stars?/i)
         || input.match(/rat(?:ed|ing)\s*(\d)/i);
  return m ? m[1] : null;
}

function extractState(input) {
  const lower = input.toLowerCase();

  // Try full state names first (longest match wins)
  // Sort by length desc so "new york" matches before "new"
  const names = Object.keys(STATE_MAP).sort((a, b) => b.length - a.length);
  for (const name of names) {
    if (lower.includes(name)) {
      return { abbr: STATE_MAP[name], matched: name };
    }
  }

  // Try 2-letter abbreviation (standalone word)
  const m = input.match(/\b([A-Z]{2})\b/);
  if (m && VALID_ABBRS.has(m[1])) {
    return { abbr: m[1], matched: m[0] };
  }

  return null;
}

function extractType(input) {
  const lower = input.toLowerCase();
  for (const [keyword, value] of Object.entries(TYPE_MAP)) {
    if (lower.includes(keyword)) {
      return { value, matched: keyword };
    }
  }
  return null;
}

function extractCity(input) {
  // "in {City}" or "in {City}, {State}" or "in {City} {State}"
  const m = input.match(/\bin\s+([a-z]+(?:\s+[a-z]+)*)/i);
  if (!m) return null;

  const candidate = m[1].trim();
  // Reject if the candidate is a state name
  if (STATE_MAP[candidate.toLowerCase()]) return null;

  return candidate;
}

export default function parseQuery(input) {
  if (!input || !input.trim()) return {};

  const params = {};
  const matched = []; // track matched fragments for debug display

  // 1) Rating
  const rating = extractRating(input);
  if (rating) {
    params.rating = rating;
    matched.push(`rating=${rating}`);
  }

  // 2) Type
  const type = extractType(input);
  if (type) {
    params.type = type.value;
    matched.push(`type=${type.value}`);
  }

  // 3) State
  const state = extractState(input);
  if (state) {
    params.state = state.abbr;
    matched.push(`state=${state.abbr}`);
  }

  // 4) City
  const city = extractCity(input);
  if (city) {
    params.city = city;
    matched.push(`city=${city}`);
  }

  // 5) Fallback: if nothing matched, use raw input as name search
  if (matched.length === 0) {
    params.name = input.trim();
    matched.push(`name="${params.name}"`);
  }

  // Attach matched summary for UI display
  params._matched = matched;

  return params;
}
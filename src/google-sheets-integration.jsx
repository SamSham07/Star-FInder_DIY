/* google-sheets-integration.jsx — Fetch and parse DIY Purchase List from Google Sheets CSV export */

/**
 * Google Sheets CSV export URL
 * Format: https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={SHEET_ID}
 * This pulls the CSV directly without needing authentication
 */
const SHEET_ID = '1fyN84sFLIRpurJ-vIOokNU0CPDmaLwmkEmSnSbbtwU4';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
// Human-viewable sheet URL — opened in a new tab for the survey list log
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;
window.SHEET_URL = SHEET_URL;

/**
 * Parse CSV text into array of objects
 * Handles quoted fields and newlines within cells
 */
function parseCSV(text) {
  const lines = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === '\n' && !inQuotes) {
      if (currentLine.trim()) lines.push(currentLine);
      currentLine = '';
    } else {
      currentLine += char;
    }
  }

  if (currentLine.trim()) lines.push(currentLine);

  if (lines.length === 0) return [];

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.some(v => v.trim())) { // Skip empty rows
      const row = {};
      headers.forEach((h, idx) => {
        row[h.trim()] = values[idx] ? values[idx].trim() : '';
      });
      data.push(row);
    }
  }

  return data;
}

/**
 * Parse a single CSV line, respecting quoted fields
 */
function parseCSVLine(line) {
  const fields = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }

  fields.push(currentField);
  return fields;
}

/**
 * Fetch and process sales data from Google Sheet
 * Returns: { totalUnits, stateData: { [state]: count } }
 */
async function fetchSalesData() {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const csvText = await response.text();
    const rows = parseCSV(csvText);

    // Aggregate by state — sum No_of_unit column
    const stateCount = {};
    let totalUnits = 0;

    rows.forEach(row => {
      const state = row['State_of_Sales']?.trim();
      if (state && state.length > 0) {
        const qty = parseInt(row['No_of_unit'], 10) || 1;
        stateCount[state] = (stateCount[state] || 0) + qty;
        totalUnits += qty;
      }
    });

    console.log('Sales data loaded:', { totalUnits, stateCount });
    return { totalUnits, stateCount };
  } catch (error) {
    console.error('Failed to fetch sales data:', error);
    // Return null to trigger fallback to hardcoded data
    return null;
  }
}

Object.assign(window, { fetchSalesData, parseCSV });

/**
 * Malaysian state coordinates on the SVG map (viewBox 0 0 400 600)
 * Peninsular Malaysia on the left, Borneo (Sabah/Sarawak) on the right
 */
const MY_STATE_COORDS = {
  'Perlis':          { x: 95,  y: 70,  label: 'Perlis' },
  'Kedah':           { x: 82,  y: 105, label: 'Kedah' },
  'Penang':          { x: 62,  y: 130, label: 'Penang' },
  'Perak':           { x: 100, y: 170, label: 'Perak' },
  'Kelantan':        { x: 150, y: 110, label: 'Kelantan' },
  'Terengganu':      { x: 175, y: 155, label: 'Terengganu' },
  'Pahang':          { x: 155, y: 210, label: 'Pahang' },
  'Selangor':        { x: 92,  y: 235, label: 'Selangor' },
  'Kuala Lumpur':    { x: 108, y: 240, label: 'Kuala Lumpur' },
  'Putrajaya':       { x: 108, y: 255, label: 'Putrajaya' },
  'Negeri Sembilan': { x: 118, y: 262, label: 'N. Sembilan' },
  'Melaka':          { x: 128, y: 288, label: 'Melaka' },
  'Johor':           { x: 158, y: 320, label: 'Johor' },
  'Sarawak':         { x: 255, y: 370, label: 'Sarawak' },
  'Sabah':           { x: 345, y: 280, label: 'Sabah' },
  'Labuan':          { x: 318, y: 268, label: 'Labuan' },
  'Singapore':       { x: 162, y: 348, label: 'Singapore' },
};

/**
 * Build display-ready state bubbles from live sales data.
 * Returns array sorted by count desc: [{ state, label, x, y, sold }]
 */
function buildStateBubbles(stateCount) {
  if (!stateCount) return [];
  return Object.entries(stateCount)
    .map(([state, sold]) => {
      const coord = MY_STATE_COORDS[state] || MY_STATE_COORDS[state.trim()];
      if (!coord) {
        console.warn('No map coordinate for state:', state);
        return null;
      }
      return { state, label: coord.label, x: coord.x, y: coord.y, sold };
    })
    .filter(Boolean)
    .sort((a, b) => b.sold - a.sold);
}

Object.assign(window, { MY_STATE_COORDS, buildStateBubbles });


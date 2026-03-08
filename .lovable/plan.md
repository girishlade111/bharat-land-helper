

# Bharat Land Converter — Implementation Plan

## Overview
A complete Indian land area unit converter web app targeting farmers, real estate agents, lawyers, and students. Mobile-first, offline-capable, no backend needed.

## Design Theme
- Green primary (#16a34a) with amber accent (#d97706) on a light green background (#f0fdf4)
- Card-based UI with rounded corners, subtle shadows, clean and trustworthy feel
- Inter + Noto Sans Devanagari fonts for English/Hindi support

## Pages & Layout
Single-page app with a sticky header (logo + state selector + language toggle) and scrollable sections below.

## Features to Build

### 1. State Selector
Dropdown in the header to pick an Indian state. Selecting a state prioritizes that state's local units in all dropdowns and result grids.

### 2. Main Converter
- Large number input with "From Unit" dropdown (units grouped by state/category)
- Responsive grid showing ALL conversion results simultaneously as cards
- Each card: unit name, converted value, small note (e.g. "33×33 ft")
- Click card to copy value; highlight the "from" unit card differently

### 3. Filter Tabs
Tab buttons (All | Standard | Maharashtra | UP | Bihar | Punjab | South) to filter the results grid instantly.

### 4. Area Visual Diagram
SVG square that scales proportionally to the input area, with contextual labels (sqft dimensions for small, Guntha for medium, Acre for large) and emojis (🌱/🌾/🏡).

### 5. Land Rate Calculator
Toggle section with ₹ rate input and unit selector. Shows total land value in Indian number format (₹ 12,50,000 and ₹ 12.5 Lakh).

### 6. Shareable Results
- "Share" button generates a URL with query params (?v=VALUE&u=UNIT&s=STATE) and copies to clipboard
- "WhatsApp Share" opens wa.me with pre-formatted conversion summary

### 7. My Land List (localStorage)
- Name and save land parcels locally
- List with delete option, total area footer
- Pro upsell banner after 3+ saved parcels
- Export as text for WhatsApp/print

### 8. Quick Reference Table
Collapsible sections showing common equivalents per region (Maharashtra, UP/Bihar, Punjab, South).

### 9. Unit Search
Search bar to find units across all states (e.g. type "kattha" → see all Kattha variants).

### 10. Language Toggle (English / Hindi)
All UI labels, unit names, and buttons switch between English and Hindi. Indian number formatting throughout.

### 11. Comparison Mode
"Compare Bigha across states" view with a table and pure CSS bar chart showing relative sizes.

### 12. Footer
Branding, tagline in Hindi, privacy/about links.

## Data Architecture
- All unit definitions stored in a single TypeScript config file with sqft conversion factors, state groupings, Hindi labels, and notes
- localStorage for saved parcels
- URL query params for sharing

## Conversion Logic
Base unit: Square Feet. Formula: `Result = (InputValue × FromUnit_sqft) / ToUnit_sqft`. All 35+ units with exact sqft values as specified.

## SEO
Title, meta description, OG tags, canonical URL, and Schema.org SoftwareApplication markup in index.html.


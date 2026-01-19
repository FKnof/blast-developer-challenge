# CS:GO Match Log Parser & Analytics

This project parses a CS:GO server log file and visualizes match statistics in a clean, focused web interface.
The goal of the challenge was to demonstrate **data parsing, backend processing, and frontend presentation**, while keeping the solution practical, maintainable, and easy to reason about.

---

## Overview

The application consists of:

* A **backend parsing layer** that processes raw server logs into structured events
* A **frontend UI** that presents match results, player statistics, and progression charts
* A clear separation between **parsing**, **aggregation**, and **presentation**

The solution focuses on correctness, clarity, and intentional tradeoffs rather than maximum feature coverage.

---

## Tech Stack

**Backend**

* TypeScript
* Node.js
* Vercel Serverless Functions

**Frontend**

* React
* TypeScript
* Tailwind CSS
* shadcn/ui components
* Recharts for data visualization
* Lucide React for icons

**Deployment**

* Vercel (serverless, cost-effective, minimal setup)

---

## Architecture

The project follows a simple, layered architecture:

```
Log File
  → Line-by-line Parser
    → Structured Events
      → Aggregation per API View
        → Frontend UI
```

* Parsing and aggregation happen on the **server**
* The frontend only **renders prepared data**
* No business logic or data processing is done client-side

This keeps responsibilities clear and avoids duplicated logic.

---

## Parsing Approach

### Line-by-Line Streaming

* The log file is parsed **incrementally, one line at a time**
* This avoids loading the entire file into memory and keeps the logic simple

### Includes-Based Routing

* Event detection uses cheap `string.includes()` checks
* Regex is used **only inside specific parse functions**, never for routing

This approach was chosen because:

* It is easier to debug than large, global regexes
* It is more maintainable when adding or adjusting event types
* It makes parsing behavior explicit and readable

### Noise Filtering

* System noise and non-gameplay events are filtered early using explicit domain rules
* Only gameplay-relevant events are considered for statistics

### Fault Tolerance & Observability

* The parser **never throws**
* Unparseable lines are classified as `unknown` or `malformed`
* Parsing statistics are tracked (total / parsed / unknown / malformed)

This ensures robustness and transparency instead of silent failures.

---

## Runtime Parsing Decision

Parsing happens **at runtime on the server** when API endpoints are called.

This was a deliberate choice to:

* Keep the system simple
* Avoid premature optimization
* Make the parsing logic easy to inspect and reason about

For the scope of this challenge, the dataset size makes this tradeoff acceptable.

---

## Frontend & UI Decisions

### Rendering Strategy

* Client-side rendering is used and sufficient for this challenge
* In a production environment, server-side rendering would be preferred for better SEO and initial load performance

### UI Components

* Built with **shadcn/ui** and **Tailwind CSS**
* Recharts for interactive data visualizations
* Lucide React for consistent iconography
* Minimal custom styling to keep focus on structure and data

### Responsive Design

* **Mobile-first approach** with optimized layouts for all screen sizes
* Icon-based navigation on small screens (< 640px)
* Progressive disclosure of information based on available screen space
* Touch-friendly button sizes and spacing

### Information Architecture

The UI is split into **focused views (tabs)** to avoid cognitive overload. Each tab answers a specific question:

* **Match Stats**: Individual player performance for both teams (kills, deaths, ADR, headshot %)
* **Score Progression**: How the score evolved round by round with halftime indicator
* **Player Spotlight**: Individual player analysis compared to match average
* **Round Durations**: Duration of each round color-coded by winning team

This keeps the interface easy to understand and aligned with how match data is typically consumed.

---

## Tradeoffs

This project intentionally accepts the following tradeoffs:

* **Runtime parsing** means the log file is re-parsed on cold starts
* **No long-term persistence** due to serverless execution
* **Client-side rendering** is not SEO-optimal
* Advanced metrics are approximations based on available log data, not demo files

These decisions were made to keep the solution focused and avoid unnecessary complexity.

---

## Future Improvements

If this were extended beyond the challenge scope, the next steps would be:

* Persist parsed events or aggregates to avoid repeated parsing
* Introduce caching for serverless cold starts
* Use server-side rendering for improved SEO and performance
* Add swipe-based tab navigation for mobile devices
* Add more advanced performance metrics with richer data sources (demo files)
* Implement real-time match tracking for live games
* Add filtering and sorting capabilities to player stats

---

## How to Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Then open the app in your browser as instructed by the development server (typically http://localhost:5173).

---

## API Endpoints

The backend provides the following serverless API endpoints:

* `/api/match` - Match metadata (teams, scores, map, date)
* `/api/scoreboard` - Player statistics and team performance
* `/api/progression` - Round-by-round score progression
* `/api/rounds` - Individual round data (duration, winner, side)

All endpoints accept an optional `?file=` query parameter to specify which log file to parse.

---

## Final Notes

This project focuses on **clear architecture, intentional design decisions, and honest tradeoffs** rather than maximal feature depth.
The goal was to demonstrate how I approach parsing, data modeling, and UI design in a real-world scenario.

The solution prioritizes:

* **Readability** over cleverness
* **Explicitness** over magic
* **Simplicity** over premature optimization
* **Robustness** over silent failures

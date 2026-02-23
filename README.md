# Infinity Ops

A personal operations app inspired by Monday.com — built for iPad with Vite + React + TypeScript.

## Features

- 📅 **Calendar** — Full month view, color-coded events by category (task = red, reminder = purple, event = cyan, invoice = green). Supports recurring monthly events with customer name & amount.
- 📁 **Projects** — Create projects with category, status, start/due dates. Day countdown shows how many days remain (or overdue). Notes hierarchy: Project → Notes → Tasks. Each task has a notebook/workspace popup for Apple Pencil notes.
- 🧾 **Invoice Reminders** — Recurring monthly customer invoices with amount and day of month.
- 💳 **Bills** — Recurring monthly bills grouped by category (web dev, app dev, software, brand & design, social media marketing).
- 💰 **Price List** — Services/products with SKU codes, prices, categories, descriptions. Searchable and filterable.
- 📝 **Notes** — Global notes saved from task workspaces, linked back to projects/events.

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Then open http://localhost:5173 in your browser (or iPad Safari via your local network IP).

## Tech Stack
- Vite + React 18 + TypeScript
- Zustand (state management with localStorage persistence)
- date-fns (date utilities)
- lucide-react (icons)
- Syne + DM Sans fonts (Google Fonts)

## Usage Tips
- All data is saved automatically to your browser's localStorage
- In a project, click a task's notebook icon (📖) to open the workspace
- Save workspace notes with ⌘S or the Save button — they'll appear in the Notes section linked to the project
- Calendar events with "monthly" recurring will appear every month on the same day

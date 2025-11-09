# SSG Static Snapshots

This directory contains pre-rendered HTML snapshots of key routes for SSG (Static Site Generation) deployment.

These files serve as a fallback if the hosting provider doesn't properly serve `index.html` files from subdirectories.

## Generated Files Structure

After running `npm run build:ssg`, copy these files from `dist/` to this directory:

- `/` → `dist/index.html` (already served by Vite)
- `/search` → `dist/search/index.html` → copy to `public/snapshots/search/index.html`
- `/results/JFK-LAX/2026-01-10` → `dist/results/JFK-LAX/2026-01-10/index.html` → copy to `public/snapshots/results/JFK-LAX/2026-01-10/index.html`
- `/results/MIA-BOG/2026-01-10` → `dist/results/MIA-BOG/2026-01-10/index.html` → copy to `public/snapshots/results/MIA-BOG/2026-01-10/index.html`

## Usage

These files can be linked from the Home page as a fallback testing mechanism if path-based routing doesn't work on the hosting platform.

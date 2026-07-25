# Top Steel Tracker

Internal tool for tracking pallet locations in the "Top Steel" backroom (locations 1-214).

## Current version (v2 - Multi-page + Access Code Login)

Static, front-end-only app. Data is currently stored in the browser's `localStorage` as a placeholder — the next step is wiring this to Firebase so data is saved and shared live across the whole team.

### Pages

| File | Purpose |
|---|---|
| `index.html` | Login screen. Black background, centered access-code box. |
| `menu.html` | Post-login landing page with the three action buttons: Add, Remove, Search. |
| `add.html` | Assign a pallet to an open Top Steel location. |
| `remove.html` | Clear a pallet from an occupied Top Steel location. |
| `search.html` | Search all assigned pallets by location, description, or associate. |

Every interior page (menu, add, remove, search) shows the same header and a bottom navigation bar with Add / Remove / Search links, so users can jump between pages without going back to the menu.

### Shared files (used by multiple pages)

| File | Purpose |
|---|---|
| `style.css` | All styling for every page, including the login screen. |
| `login.js` | Access-code check + session handling. **Admin code: 1595. User code: 2026.** (placeholder — real accounts come later) |
| `data.js` | Single source of truth for reading/writing pallet records. This is the ONLY file that needs to change when we wire up Firebase. |
| `theme.js` | Light/dark mode toggle, shared by all interior pages. |
| `nav.js` | Renders the shared header and bottom nav bar on every interior page. |
| `grid.js` | Shared 214-location grid renderer, used by both Add and Remove pages. |

### Page-specific files

| File | Purpose |
|---|---|
| `add.js` | Modal + save logic for the Add page. |
| `remove.js` | Modal + confirm logic for the Remove page. |
| `search.js` | Filtering + results rendering for the Search page. |

### Access codes (temporary)

- Admin: `1595`
- User: `2026`

These are placeholders. Once Firebase auth is wired up, we'll replace this with real per-person accounts, and the admin code will control who can edit the locked "Today's Date" field.

### Pallet fields

- **Top Steel #** — numbers only, 1-214, one pallet per location enforced
- **Pallet Description**
- **Today's Date** — auto-filled MM/DD, locked (grayed out) for all users
- **PLE Associate**
- **Notes** — multi-line, auto-wrapping textarea

## Next step: Firebase

To persist data for real and sync it across the team:
1. Add the Firebase JS SDK via CDN.
2. Replace the `localStorage` calls inside `data.js` with Firestore reads/writes — no other file should need to change.
3. Add real-time listeners so everyone sees updates live.
4. Add real authentication so only admins can edit the locked date field and manage users.

## Deploying to Vercel

Once this repo is pushed to GitHub:
1. In Vercel, open the connected `top-steel-tracker` project.
2. Confirm the Git integration points at this repository.
3. Since this is a static, multi-page HTML site with no build step, set the Framework Preset to "Other" and leave Build Command / Output Directory blank (or point Output Directory to the project root).
4. Push to your production branch (commonly `main`) to trigger the first deployment. Every subsequent push will auto-deploy.

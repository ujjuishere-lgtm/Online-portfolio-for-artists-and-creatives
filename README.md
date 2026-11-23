# Online Portfolio for Artists and Creatives

**CSE326: Internet Programming · Lovely Professional University · Section K4P26HB**
**Group 04 (Project P04):** Ujjawal Priyadarshi · Anushka Singh · Sukanya Tripathi

## Problem
Social channels compress media and lack curated exhibition galleries for artists.

## Objective
A responsive artwork showcase with categorised galleries and direct commissions.

## Required features and where they live
| Requirement | What it does | File |
|---|---|---|
| Lightbox previews | Full-size preview, prev/next, ← → Esc keys, swipe, focus trap, counter | `js/lightbox.js` |
| Category filtering | Filter chips with live counts, search, sort, empty state | `js/gallery.js` |
| Inquiry / commission form with validation | 8 fields, live inline errors, regex checks, date rules, saves to localStorage | `js/form.js` |
| Admin upload portal | Login, drag-and-drop upload, image validation + compression, edit/delete/feature, inquiries inbox | `admin.html`, `js/admin.js` |

## Tech
HTML5 · CSS3 (Grid, Flexbox, CSS variables, `color-mix`) · vanilla JavaScript (ES6). No framework, no backend.
Data is stored in the browser with `localStorage`.

## Folder structure
```
index.html          public portfolio
admin.html          admin portal
css/style.css       design system + responsive layout
js/storage.js       data layer (localStorage, seed data)
js/common.js        shared helpers (toast, theme, navbar, confirm dialog, reveal)
js/gallery.js       gallery rendering, filter/search/sort, testimonials
js/lightbox.js      lightbox component
js/form.js          commission form + validation
js/admin.js         admin portal logic
assets/art/*.svg    12 original demo artworks
assets/artist.svg   artist portrait
```

## Admin login (demo)
- Open `admin.html`
- Username: `admin`
- Password: `art@2026`

The check runs in the browser, so it is a demo only. A real site would verify it on a server.

## Run locally
Open `index.html` in a browser. Or run a tiny server: `python -m http.server 8000`, then visit `http://localhost:8000`.

## Deploy on GitHub Pages
1. Create a GitHub repository and push this folder (make sure `index.html` is in the repository root).
2. Repository → **Settings → Pages**.
3. Source: **Deploy from a branch** → branch `main`, folder `/ (root)` → Save.
4. After about a minute your live URL is `https://<username>.github.io/<repo-name>/`.
5. Open the live URL on a phone and a desktop, and test the admin login and the form.

(Vercel / Netlify: drag the folder in or import the repository. No build settings are needed.)

## Division of work (equal contribution)
| Member | Area | Files |
|---|---|---|
| Member 1 | **Interface design**: layout, typography, colour, responsive CSS, animations, dark mode | `css/style.css`, `index.html` |
| Member 2 | **Dynamic DOM logic**: gallery rendering, filter/search/sort, lightbox, testimonials slider | `js/gallery.js`, `js/lightbox.js`, `js/common.js` |
| Member 3 | **Validation and data persistence**: commission form, admin portal, localStorage layer | `js/form.js`, `js/admin.js`, `js/storage.js`, `admin.html` |

Each member should commit their own files from their own GitHub account so the history shows individual contributions.

## How the data works
- First visit: `Store` seeds 12 demo artworks into `localStorage` (`aw_artworks`).
- Admin uploads are resized to max 1400 px, re-encoded as JPEG and saved as a data URL with the artwork details, so they show on the public gallery straight away.
- Commission requests are saved under `aw_inquiries` and appear in the admin Inquiries tab.
- Admin → **Reset demo data** restores everything; **Export JSON** downloads a backup.
- Data lives in each visitor's own browser. That is normal for a front-end-only project; a production site would use a database.

## Testing checklist
1. Gallery shows 12 artworks; each filter chip shows the right count.
2. Search "moon" returns matching works; a nonsense search shows the empty state.
3. Clicking a card opens the lightbox; ← → and Esc work; it only cycles through the filtered works.
4. On mobile width (375 px) there is no horizontal scroll, the hamburger menu works and the lightbox can be swiped.
5. Submitting the empty commission form shows an error on every required field.
6. Invalid email, a past deadline and a message under 20 characters are each rejected with a clear message.
7. A valid submission shows a toast and a confirmation modal and clears the form.
8. Admin login rejects wrong credentials and accepts `admin` / `art@2026`.
9. Uploading a `.txt` file or an image over 2 MB is rejected; a valid image is published and appears on the public page.
10. Edit, Feature and Delete (with confirm dialog) work; the new inquiry appears in the Inquiries tab.

## Likely viva questions
1. **Why localStorage?** No backend is needed, data persists between visits, and it works on static hosting. The limit is about 5 MB per site and the data is per-browser.
2. **What is event delegation, and where did you use it?** One listener on a parent handles clicks for many children. Used on the gallery grid, the filter buttons and the admin lists, so newly rendered cards work without re-attaching listeners.
3. **How does the lightbox know which artworks to cycle through?** `Lightbox.open(list, index)` receives the currently filtered array, so next/previous never leave the active category.
4. **How is the form validated?** A `rules` object maps each field to a function that returns an error message or an empty string. It runs on blur, on input after the first touch, and for all fields on submit. Submission is blocked until every rule passes.
5. **Why compress uploaded images on a canvas?** localStorage is small. Resizing to 1400 px and encoding as JPEG keeps each artwork to a few hundred KB.
6. **Why `UI.esc()` before inserting text into `innerHTML`?** To prevent XSS: user-typed titles or messages could contain HTML or scripts.
7. **How is the layout responsive?** CSS Grid and Flexbox, `clamp()` for fluid type, CSS columns for the masonry gallery (3 → 2 → 1) and breakpoints at 1024, 860, 760 and 600 px.

# The Pass — Restaurant POS

A table-ordering, kitchen/bar display, and checkout system. Each tablet (table,
kitchen, bar, manager) is just a browser pointed at this same web app — they
stay in sync through the backend in `/server`.

## Project structure

```
/                 frontend (React + Vite + Tailwind)
  src/App.jsx     the whole app
  src/lib/storage.js   the only file that talks to the backend
/server           reference backend (Express + a JSON file as a starter datastore)
```

## 1. Run it locally

```bash
# backend
cd server
npm install
npm start          # listens on http://localhost:8787

# frontend (separate terminal)
cd ..
npm install
cp .env.example .env     # VITE_API_BASE=http://localhost:8787
npm run dev               # http://localhost:5173
```

Open `http://localhost:5173` on one device for the staff dashboard, and
`http://localhost:5173/?table=3` on another to see what a guest tablet at
table 3 looks like. Both will sync through the backend.

## 2. Deploy the backend

The included `server/` is a working starting point (Express + a JSON file),
fine for trying this out, but a flat file can lose data if two tablets write
at the same instant. **Before relying on this in a busy service, swap
`readData`/`writeData` in `server/index.js` for a real database** — Postgres,
Supabase, or Firebase are all reasonable choices and only touch that one file.

Deploy it anywhere that runs Node (Render, Railway, Fly.io, a small VPS).
Set the `CORS` origin in `server/index.js` to your real frontend domain
instead of allowing all origins.

## 3. Deploy the frontend

```bash
npm run build
```

This outputs static files to `dist/`. Deploy `dist/` to Vercel, Netlify, or
any static host. Set the environment variable `VITE_API_BASE` to your
deployed backend's URL before building.

## 4. Set up the tablets

Each table's tablet should open to `https://your-app.com/?table=N` — the app
detects that URL parameter and skips straight to that table's menu with no
table picker, no staff tabs, just ordering, a call-staff button, and their
own order status.

Lock each tablet into kiosk mode so guests can't navigate away:
- **Android**: an app like Fully Kiosk Browser, pointed at the table's URL
- **iPad**: Guided Access (Settings → Accessibility), or an MDM kiosk profile

Staff devices (the kitchen screen, bar screen, checkout counter, and a
manager's tablet/phone) just open `https://your-app.com/` with no `?table=`
param — that lands on the Floor map and shows the full nav (Table order,
Kitchen, Bar, Checkout, Floor map, Menu).

## 5. Print the table QR codes

Once the real URL is live, open the **Floor map** tab on a staff device, tap
each table, and you'll see a QR code that now encodes the real working link.
Print or laminate these for table tents — scanning one opens that table's
ordering screen directly, same as tapping the URL manually.

## 6. Before going live, also do this

- **Add staff login.** Right now anyone with the URL (no `?table=`) sees the
  full kitchen/bar/checkout/menu dashboard. Add a simple PIN or login screen
  in front of the staff views before this touches a real restaurant.
- **Replace the payment form.** The card form in Checkout is a visual demo —
  no real charge happens. Wire up [Stripe Terminal](https://stripe.com/terminal)
  or your existing card processor for actual payments.
- **Move menu photos off the JSON blob.** Photos are currently stored as
  base64 text inside the same record as everything else. That's fine for a
  small menu; for a large photo-heavy menu, upload images to S3/Cloudinary
  instead and store just the URL.

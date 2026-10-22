# ReUse Campus (frontend)

Share more. Waste less. Save together.

## Run
Browsers block loading local script files, so serve the folder:

    npx serve .
    # or: python3 -m http.server 8000

Open the printed address.

## Demo logins
- Student: any name, 10-digit mobile, year
- Admin: ID `admin`, password `admin123` (demo only; replace with JWT login from the backend)

## Structure
    index.html            loads React, Babel and the files below in order
    css/styles.css        all styling (light and dark mode)
    src/data.js           categories, deal types, seed listings, helpers
    src/components/       Login, Browse, Add, Notifs, Chats, Admin, App
    src/main.jsx          mounts the app

## Connecting the backend
State lives in `db` inside `App.jsx` (saved in localStorage). Replace the `upd(...)` calls with
`fetch('/api/...')` calls for: auth, listings, requests, reports (see API.md in the proposal).

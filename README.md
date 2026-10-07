# UC Merced Campus Parking

A small parking PWA for UC Merced. With the number of complaints received about parking spaces, we decided to create an app that allows students to check available and occupied spots.

The goal is to help students check parking before driving around campus looking for a space. The dashboard reads a supplied JSON file; the map is displayed separately through an iframe.

**Current status:** The dashboard and JSON reader are built. The real parking data file and campus map link are still needed. No live campus availability is connected yet.

## How it works

1. Check the dashboard for available and occupied space counts.
2. Select a lot to see its counts and total spaces.
3. View the campus map once the iframe link is connected. Green represents available spaces; red represents occupied spaces.

While the app is open, the system checks the parking data file every minute and updates the availability counts when the JSON data changes. It also checks when the page opens, the connection returns, or the Refresh counts button is pressed. Unchanged counts keep the existing dashboard and lot selection. Missing or invalid data shows a warning. Counts older than 60 seconds are marked potentially outdated.

## Built with

- **Python:** serves the page and reads the parking JSON file. No runtime packages are required.
- **HTML, CSS, and JavaScript:** a simple responsive dashboard without React or a build step.
- **PWA:** supports installation and caches the page shell. Fresh counts and the external map require a connection; counts are not saved between visits.

## Run locally

Use Python 3.10 or newer:

```sh
python app.py
```

Open [localhost:8000](http://127.0.0.1:8000/). On this Windows computer, `./run.ps1` also starts the app. Installation requires HTTPS or localhost. The Python server is for local development.

## Connect the data and map

Place `parking.json` beside `app.py`, or set `PARKING_DATA_FILE` to its path before starting Python. The expected format is shown below; these values are examples, not live data:

```json
{
  "updated_at": "2026-10-05T23:00:00Z",
  "lots": [{
    "id": "lot-a",
    "name": "Lot A",
    "spaces": [
      {"id": "1", "status": "available"},
      {"id": "2", "status": "occupied"}
    ]
  }]
}
```

Each update contains all lots and spaces, with a current observation timestamp. Lot IDs must be unique, and space IDs must be unique within each lot. Replace the file atomically to avoid incomplete reads; no server restart is needed for data updates. The reader may need adjustment when the actual JSON format is provided.

Set `PARKING_MAP_URL` to the provider's iframe URL before starting Python. The provider must allow embedding. Dashboard counts come from JSON, not from reading colors inside the iframe.

## Project structure

```text
app.py                 Python server
public/                Dashboard, styles, JavaScript, PWA files, and icons
assets/                Original bobcat artwork
run.ps1                Windows startup script
test_app.py            Server tests
test_parking_data.mjs   Parking data validation tests
```

## What's next

1. Connect the supplied JSON and actual campus map.
2. Verify that dashboard counts match the map, including full lots and delayed updates.
3. Test installation and usability on phones.
4. Test traffic and measure server response times before deciding whether polling or hosting needs changes.
5. Deploy with HTTPS after the data connection is verified.

These are planned steps, not completed features.

## Checks

```sh
python -m unittest -v
node --test test_parking_data.mjs
node --check public/app.js
```

Tests cover file updates, missing or invalid JSON, status validation, and public server routes. After editing browser files, increase the cache version in `public/sw.js` so installed copies receive the update.

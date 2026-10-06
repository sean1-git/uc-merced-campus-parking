# Campus Parking

A simple Python PWA with a campus map iframe and parking counts from a JSON file.

## Run

Run `python app.py` with Python 3.10 or newer, or `./run.ps1` on this Windows computer. Open http://127.0.0.1:8000. No packages or build step are required.

## Parking data

Place the supplied file at `parking.json` beside `app.py`. Python reads it on each request to `/api/parking`; the dashboard checks every 10 seconds. Replacing the file updates the counts without restarting Python. The Refresh counts button checks immediately.

Until the actual file is supplied, this is the expected format (illustrative values only):

```json
{
  "updated_at": "2026-10-05T23:00:00Z",
  "lots": [
    {
      "id": "lot-a",
      "name": "Lot A",
      "spaces": [
        {"id": "1", "status": "available"},
        {"id": "2", "status": "occupied"}
      ]
    }
  ]
}
```

Only `available` and `occupied` are accepted. Lot IDs must be unique; space IDs must be unique within a lot. Each file is a complete snapshot. Update `updated_at` with the actual observation time. Counts older than 60 seconds are marked potentially outdated. Missing or invalid files leave the last valid counts visible with a warning; before the first valid file, counts show dashes.

The final supplied JSON structure may need an adapter. To use a different file path, set `PARKING_DATA_FILE` before starting Python. The producer should write a temporary file and replace the old file atomically to avoid partially written JSON.

## Campus map

Set the iframe URL before starting the server:

```powershell
$env:PARKING_MAP_URL = 'https://your-map-provider.example/embed'
./run.ps1
```

Replace this placeholder with the actual URL. The provider must allow your app to embed its map. The iframe displays the map independently of the JSON dashboard. No iframe messages or reading marker colors are required.

## Files

| File | Purpose |
| --- | --- |
| `app.py` | Serve public files, map configuration, and parking JSON |
| `public/index.html` | Dashboard and map iframe |
| `public/styles.css` | Desktop and mobile styles |
| `public/app.js` | Refresh counts and select lots |
| `public/parking-data.mjs` | Validate JSON and count available/occupied spaces |
| `public/pwa.js` | Installation and service worker registration |
| `public/sw.js` | Offline page shell and old-cache cleanup |

The original bobcat image is in `assets/parking-bobcat.png`. `make_icons.py` regenerates icons using Pillow; Pillow is not needed to run the app.

## PWA and checks

Installation requires HTTPS or localhost. The page shell can reopen offline after an online visit; the map and fresh JSON require a connection. Counts are not saved between visits. Increase the service worker cache version after changing browser files and restart Python after server changes.

```sh
python -m unittest -v
node --test test_parking_data.mjs
node --check public/app.js
```

The real JSON file and iframe URL are still needed for provider integration testing. Traffic testing comes later. The included Python server is for local development.

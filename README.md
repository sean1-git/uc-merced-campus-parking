# Campus Parking

A small parking demo built with Python, HTML, CSS and JavaScript. It shows four sample lots and how many spaces are available. The counts and map are not official campus data.

## Run it

With Python 3.10 or newer:

```sh
python app.py
```

Then open http://127.0.0.1:8000. Stop the server with Ctrl+C.

On this Windows computer, `./run.ps1` can also start it using the existing Python runtime. If port 8000 is busy, use `python app.py --port 8001`.

No packages or build step are needed to run the app.

The bobcat icon comes from the supplied PDF. Its original artwork is saved in `assets/parking-bobcat.png`. The ready-to-use icons are in `public/`. To regenerate those sizes, run `python make_icons.py` with Pillow installed; Pillow is only needed for this optional step.

## How it works

1. Python serves the page and sample parking data at `/api/lots`.
2. JavaScript loads the data and calculates the dashboard totals.
3. Selecting a lot in the list or map updates its details.
4. The browser saves the page and counts for offline use. Saved counts are marked as potentially outdated.

“Limited” means 15% or fewer spaces remain. Refresh reloads the same sample data; there are no live sensors or AI features.

## Where to make changes

| File | Purpose |
| --- | --- |
| `app.py` | Python server and sample `LOTS` data |
| `public/index.html` | Page layout, map drawing and reusable lot templates |
| `public/styles.css` | Desktop and mobile styles, grouped into sections |
| `public/app.js` | Load counts, build lot buttons and handle selection |
| `public/pwa.js` | App installation and offline setup |
| `public/sw.js` | Save files and return cached data when offline |
| `public/manifest.webmanifest` | Installed app name, colors and icons |

To change parking counts, edit `LOTS` in `app.py`. To change the wording, edit `index.html`. To change the layout or colors, edit `styles.css`.

After changing browser files, increase `CACHE_NAME` in `sw.js` and reload the page so the browser replaces its saved copy. Python changes require restarting the server.

## Install and offline use

Open the app online once before trying it offline. Use the browser's Install app option; on iPhone, use Safari → Share → Add to Home Screen.

PWA installation requires HTTPS or localhost. A phone's localhost points to the phone, not your computer. Use HTTPS hosting to install it on a phone. The included Python server is for local development.

## Check it

```sh
python -m unittest -v
node --check public/app.js
node --check public/pwa.js
node --check public/sw.js
```

In the browser, check that map and list selections match, full lots show zero spaces, and the page still opens with saved counts after stopping the server.


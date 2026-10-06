"""Small, dependency-free parking PWA demo. Run: python app.py."""
import argparse
import json
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

PUBLIC = Path(__file__).parent / 'public'
PUBLIC_ROUTES = {
    '/', '/index.html', '/styles.css', '/app.js', '/pwa.js', '/sw.js',
    '/manifest.webmanifest', '/icon-32.png', '/icon-192.png', '/icon-512.png',
}

# Sample data only. Change these values to update the demo.
LOTS = [
    {
        "id": "north",
        "name": "North Lot",
        "zone": "North campus",
        "available": 42,
        "capacity": 120,
        "walk": 4
    },
    {
        "id": "lake",
        "name": "Lake Lot",
        "zone": "East campus",
        "available": 8,
        "capacity": 80,
        "walk": 6
    },
    {
        "id": "south",
        "name": "South Lot",
        "zone": "South campus",
        "available": 78,
        "capacity": 200,
        "walk": 8
    },
    {
        "id": "bellevue",
        "name": "Bellevue Lot",
        "zone": "West campus",
        "available": 0,
        "capacity": 140,
        "walk": 10
    }
]


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC), **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/api/lots':
            self.send_parking_counts()
        elif path in PUBLIC_ROUTES:
            super().do_GET()
        else:
            self.send_error(404)

    def send_parking_counts(self):
        data = {
            'demo': True,
            'updated_at': datetime.now(timezone.utc).isoformat(),
            'lots': LOTS,
        }
        payload = json.dumps(data).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8000)
    parser.add_argument('--host', default='127.0.0.1')
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f'Parking demo: http://{args.host}:{args.port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()

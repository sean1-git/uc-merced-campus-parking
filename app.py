"""Serve the parking prototype without requiring third-party Python packages."""
import argparse
import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

# Resolve paths relative to this script so launching from another folder works.
ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / 'frontend'
DEFAULT_DATA_FILE = ROOT / 'parking.json'
# Only expose the frontend files needed by the prototype through GET requests.
PUBLIC_ROUTES = {
    '/uc-merced-logo.png',
    '/', '/index.html', '/styles.css', '/app.js',
}

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Serve frontend assets instead of exposing files in the project root.
        super().__init__(*args, directory=str(PUBLIC), **kwargs)

    def end_headers(self):
        # Require cache revalidation so clients see updated assets and data.
        self.send_header('Cache-Control', 'no-cache')
        # Ask browsers to respect the declared content type rather than guess it.
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def do_GET(self):
        # Ignore query parameters when matching routes, including cache-busters.
        path = urlsplit(self.path).path
        if path == '/api/config':
            self.send_config()
        elif path == '/api/parking':
            self.send_parking_data()
        elif path in PUBLIC_ROUTES:
            # Reuse Python's built-in static-file serving for allowed assets.
            super().do_GET()
        else:
            self.send_error(404)

    def send_config(self):
        # Configure the map per deployment without changing frontend code.
        data = {'map_url': os.environ.get('PARKING_MAP_URL', '')}
        self.send_json(data)

    def send_parking_data(self):
        # Read on every request so replacing the file needs no server restart.
        # Allow deployments to supply a data file outside the default location.
        path = Path(os.environ.get('PARKING_DATA_FILE', str(DEFAULT_DATA_FILE)))
        try:
            # Accept UTF-8 files both with and without a byte-order mark.
            data = json.loads(path.read_text(encoding='utf-8-sig'))
        except FileNotFoundError:
            # Signal temporary unavailability while the data file is missing.
            self.send_json({'error': 'Waiting for parking.json'}, 503)
            return
        except (OSError, ValueError):
            # Handle read/JSON errors without exposing internal filesystem details.
            self.send_json({'error': 'Parking file is unavailable or invalid'}, 503)
            return
        self.send_json(data)

    def send_json(self, data, status=200):
        # Keep API success and error responses consistent in format and encoding.
        payload = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        # Measure encoded bytes rather than characters for an accurate length.
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)


def main():
    # Support command-line configuration and automatic --help output.
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8000)
    # Default to local-only access unless a different interface is requested.
    parser.add_argument('--host', default='127.0.0.1')
    args = parser.parse_args()
    # Serve concurrent requests so a slow client does not block other clients.
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    # Show the startup URL immediately, including when output is redirected.
    print(f'Campus Parking: http://{args.host}:{args.port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        # Let Ctrl+C stop the server without a traceback.
        pass
    finally:
        # Release the listening socket when the server exits.
        server.server_close()


# Allow importing this module without automatically starting the server.
if __name__ == '__main__':
    main()

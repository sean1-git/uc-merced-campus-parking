"""Serve the parking prototype without requiring third-party Python packages."""
import argparse
import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / 'frontend'
DEFAULT_DATA_FILE = ROOT / 'parking.json'
PUBLIC_ROUTES = {
    '/uc-merced-logo.png',
    '/', '/index.html', '/styles.css', '/app.js', '/sw.js',
}

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC), **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/api/config':
            self.send_config()
        elif path == '/api/parking':
            self.send_parking_data()
        elif path in PUBLIC_ROUTES:
            super().do_GET()
        else:
            self.send_error(404)

    def send_config(self):
        data = {'map_url': os.environ.get('PARKING_MAP_URL', '')}
        self.send_json(data)

    def send_parking_data(self):
        # Read on every request so replacing the file needs no server restart.
        path = Path(os.environ.get('PARKING_DATA_FILE', str(DEFAULT_DATA_FILE)))
        try:
            data = json.loads(path.read_text(encoding='utf-8-sig'))
        except FileNotFoundError:
            self.send_json({'error': 'Waiting for parking.json'}, 503)
            return
        except (OSError, ValueError):
            self.send_json({'error': 'Parking file is unavailable or invalid'}, 503)
            return
        self.send_json(data)

    def send_json(self, data, status=200):
        payload = json.dumps(data).encode('utf-8')
        self.send_response(status)
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
    print(f'Campus Parking: http://{args.host}:{args.port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()

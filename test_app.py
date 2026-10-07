import json
import os
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import urlopen
from http.server import ThreadingHTTPServer
from app import Handler


class ParkingServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f'http://127.0.0.1:{cls.server.server_port}'

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def test_map_configuration(self):
        for url in ['', 'https://map.example/embed']:
            with patch.dict(os.environ, {'PARKING_MAP_URL': url}):
                with urlopen(self.base + '/api/config') as response:
                    self.assertEqual(json.load(response), {'map_url': url})

    def test_parking_file_updates_without_restart(self):
        with TemporaryDirectory() as directory:
            path = Path(directory) / 'parking.json'
            with patch.dict(os.environ, {'PARKING_DATA_FILE': str(path)}):
                for status in ['available', 'occupied']:
                    data = {
                        'updated_at': '2026-10-05T23:00:00Z',
                        'lots': [{'id': 'a', 'name': 'Lot A', 'spaces': [
                            {'id': '1', 'status': status},
                        ]}],
                    }
                    path.write_text(json.dumps(data), encoding='utf-8')
                    with urlopen(self.base + '/api/parking') as response:
                        self.assertEqual(json.load(response), data)

    def test_missing_or_invalid_parking_file(self):
        with TemporaryDirectory() as directory:
            path = Path(directory) / 'parking.json'
            with patch.dict(os.environ, {'PARKING_DATA_FILE': str(path)}):
                for contents in [None, '{incomplete']:
                    if contents is not None:
                        path.write_text(contents, encoding='utf-8')
                    with self.assertRaises(HTTPError) as error:
                        urlopen(self.base + '/api/parking')
                    self.assertEqual(error.exception.code, 503)
                    self.assertIn('error', json.load(error.exception))

    def test_shell_assets(self):
        for path in ['/', '/styles.css', '/app.js', '/uc-merced-logo.png']:
            with urlopen(self.base + path) as response:
                self.assertEqual(response.status, 200)
                self.assertTrue(response.read())

    def test_nonpublic_paths_rejected(self):
        for path in ['/app.py', '/../app.py', '/%2e%2e/app.py', '/api/missing', '/api/lots']:
            with self.assertRaises(HTTPError) as error:
                urlopen(self.base + path)
            self.assertEqual(error.exception.code, 404)


if __name__ == '__main__':
    unittest.main()

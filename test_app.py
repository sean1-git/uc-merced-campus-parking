# Test the parking server through real HTTP requests using Python's standard library.
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
        # Start one local server for the entire test class. Port 0 lets the
        # operating system choose an available port to avoid port conflicts.
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        # Run the server in the background so tests can send requests to it.
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        # Use the actual port selected by the operating system in test URLs.
        cls.base = f'http://127.0.0.1:{cls.server.server_port}'

    @classmethod
    def tearDownClass(cls):
        # Stop serving, release the socket, and wait for the background thread
        # to finish after all tests in this class have run.
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def test_map_configuration(self):
        # Check that the config API returns both an empty and a configured map URL.
        for url in ['', 'https://map.example/embed']:
            # Temporarily change the environment and restore it after this case.
            with patch.dict(os.environ, {'PARKING_MAP_URL': url}):
                with urlopen(self.base + '/api/config') as response:
                    self.assertEqual(json.load(response), {'map_url': url})

    def test_parking_file_updates_without_restart(self):
        # Use a temporary file to avoid changing real parking data. The directory
        # and its contents are automatically removed when this block exits.
        with TemporaryDirectory() as directory:
            path = Path(directory) / 'parking.json'
            # Point the running server at the test's data file.
            with patch.dict(os.environ, {'PARKING_DATA_FILE': str(path)}):
                # Change the same space from available to occupied while keeping
                # the server running to verify it reads fresh data on each request.
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
        # Verify that unavailable data produces a controlled API error.
        with TemporaryDirectory() as directory:
            path = Path(directory) / 'parking.json'
            with patch.dict(os.environ, {'PARKING_DATA_FILE': str(path)}):
                # First leave the file missing, then create a file with invalid JSON.
                for contents in [None, '{incomplete']:
                    if contents is not None:
                        path.write_text(contents, encoding='utf-8')
                    # urlopen raises HTTPError for unsuccessful HTTP responses.
                    with self.assertRaises(HTTPError) as error:
                        urlopen(self.base + '/api/parking')
                    # Both cases should return 503 (Service Unavailable) and a
                    # JSON body containing an error message for the frontend.
                    self.assertEqual(error.exception.code, 503)
                    self.assertIn('error', json.load(error.exception))

    def test_shell_assets(self):
        # Check that the page, stylesheet, script, and logo are accessible and
        # contain data. This does not check their appearance or browser behavior.
        for path in ['/', '/styles.css', '/app.js', '/uc-merced-logo.png']:
            with urlopen(self.base + path) as response:
                self.assertEqual(response.status, 200)
                self.assertTrue(response.read())

    def test_nonpublic_paths_rejected(self):
        # Check that source-file requests, plain and encoded parent-directory
        # traversal attempts, and unsupported API routes return 404 (Not Found).
        for path in ['/app.py', '/../app.py', '/%2e%2e/app.py', '/api/missing', '/api/lots']:
            with self.assertRaises(HTTPError) as error:
                urlopen(self.base + path)
            self.assertEqual(error.exception.code, 404)


# Run the tests when this file is executed directly, such as python test_app.py.
if __name__ == '__main__':
    unittest.main()

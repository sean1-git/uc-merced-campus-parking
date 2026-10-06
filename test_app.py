import json
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

    def test_availability_contract(self):
        with urlopen(self.base + '/api/lots') as response:
            data = json.load(response)
        self.assertTrue(data['demo'])
        self.assertIn('updated_at', data)
        self.assertEqual(len({lot['id'] for lot in data['lots']}), 4)
        self.assertEqual(sum(lot['available'] for lot in data['lots']), 128)
        for lot in data['lots']:
            self.assertTrue(0 <= lot['available'] <= lot['capacity'])

    def test_manifest_and_icons(self):
        with urlopen(self.base + '/manifest.webmanifest') as response:
            manifest = json.load(response)
        self.assertEqual(manifest['display'], 'standalone')
        for icon in manifest['icons']:
            with urlopen(self.base + icon['src']) as response:
                self.assertEqual(response.read(8), b'\x89PNG\r\n\x1a\n')

    def test_shell_assets(self):
        for path in ['/', '/styles.css', '/app.js', '/pwa.js', '/sw.js', '/icon-32.png']:
            with urlopen(self.base + path) as response:
                self.assertEqual(response.status, 200)
                self.assertTrue(response.read())

    def test_nonpublic_paths_rejected(self):
        for path in ['/app.py', '/../app.py', '/%2e%2e/app.py', '/api/missing']:
            with self.assertRaises(HTTPError) as error:
                urlopen(self.base + path)
            self.assertEqual(error.exception.code, 404)


if __name__ == '__main__':
    unittest.main()

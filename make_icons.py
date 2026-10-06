"""Resize the supplied bobcat artwork for the app. Requires Pillow to regenerate."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent
SOURCE = ROOT / 'assets' / 'parking-bobcat.png'


def main():
    with Image.open(SOURCE) as artwork:
        for size in (32, 192, 512):
            icon = artwork.resize((size, size), Image.Resampling.LANCZOS)
            icon.save(ROOT / 'public' / f'icon-{size}.png', optimize=True)


if __name__ == '__main__':
    main()

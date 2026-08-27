from pathlib import Path

from PIL import Image


SOURCE = Path("/home/ubuntu/webdev-static-assets/umkm-ku-icon.png")
TARGET_DIRECTORY = Path("/home/ubuntu/paper-objective-mobile/assets/images")
TARGETS = {
    "icon.png": 1024,
    "splash-icon.png": 1024,
    "favicon.png": 256,
    "android-icon-foreground.png": 1024,
}


def optimize_asset(name: str, size: int) -> None:
    with Image.open(SOURCE) as source:
        image = source.convert("RGBA").resize((size, size), Image.Resampling.LANCZOS)
        optimized = image.quantize(colors=256, method=Image.Quantize.FASTOCTREE)
        optimized.save(TARGET_DIRECTORY / name, optimize=True, compress_level=9)


def main() -> None:
    for name, size in TARGETS.items():
        optimize_asset(name, size)
    print("Optimized", ", ".join(TARGETS))


if __name__ == "__main__":
    main()

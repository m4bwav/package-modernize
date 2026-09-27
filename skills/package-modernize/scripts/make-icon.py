#!/usr/bin/env python3
"""Draw a basic package icon: a white glyph on a rounded square, 128 x 128 PNG (nuget.org's size; under 1 MB).

For a package whose registry shows an icon (NuGet's PackageIcon) and that has none (package-modernize L-070
`generate-missing-icon`). The glyph says what the package does in one or two characters, or is one of the drawn
pictures below. Use the maintainer's colour when their other packages have one (their overlay says so).

    python make-icon.py icon.png --text "{ }"                 # JsonPrettyPrinter's style
    python make-icon.py icon.png --text N --color "#1E4078"
    python make-icon.py icon.png --picture image              # a framed picture (IsImageUrlDotNet 2.0.0)

Needs Pillow (pip install pillow). Look at the result (open the PNG) before committing it.
"""
import argparse
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFont

SCALE = 4  # draw at 4x, downscale for smooth edges
SIZE = 128
WHITE = (255, 255, 255, 255)


def hex_color(value: str):
    value = value.lstrip("#")
    if len(value) != 6:
        raise argparse.ArgumentTypeError("colour must be #RRGGBB")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (255,)


def picture_image(draw: ImageDraw.ImageDraw, canvas: Image.Image, n: int):
    s = n / SIZE
    x0, y0, x1, y1 = 22 * s, 30 * s, 106 * s, 98 * s
    draw.rounded_rectangle([x0, y0, x1, y1], radius=8 * s, outline=WHITE, width=round(7 * s))
    draw.ellipse([76 * s, 42 * s, 90 * s, 56 * s], fill=WHITE)
    inner = Image.new("L", (n, n), 0)
    ImageDraw.Draw(inner).rounded_rectangle([x0 + 7 * s, y0 + 7 * s, x1 - 7 * s, y1 - 7 * s], radius=3 * s, fill=255)
    hills = Image.new("L", (n, n), 0)
    hd = ImageDraw.Draw(hills)
    hd.polygon([(26 * s, 94 * s), (52 * s, 58 * s), (78 * s, 94 * s)], fill=255)
    hd.polygon([(60 * s, 94 * s), (80 * s, 68 * s), (102 * s, 94 * s)], fill=255)
    canvas.paste(Image.new("RGBA", (n, n), WHITE), (0, 0), ImageChops.multiply(hills, inner))


PICTURES = {"image": picture_image}


def text_glyph(draw: ImageDraw.ImageDraw, n: int, text: str):
    # Largest bold font whose text fits in 70 percent of the square.
    size = n
    while size > 8:
        try:
            font = ImageFont.truetype("DejaVuSans-Bold.ttf", size)
        except OSError:
            try:
                font = ImageFont.truetype("arialbd.ttf", size)
            except OSError:
                font = ImageFont.load_default(size=size)
        left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
        if right - left <= 0.7 * n and bottom - top <= 0.7 * n:
            break
        size = int(size * 0.9)
    x = (n - (right - left)) / 2 - left
    y = (n - (bottom - top)) / 2 - top
    draw.text((x, y), text, font=font, fill=WHITE)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("output", help="the PNG to write, such as icon.png at the repository root")
    glyph = parser.add_mutually_exclusive_group(required=True)
    glyph.add_argument("--text", help="one or two characters, such as '{ }' or 'N'")
    glyph.add_argument("--picture", choices=sorted(PICTURES), help="a drawn picture")
    parser.add_argument("--color", type=hex_color, default=hex_color("#1E4078"), help="background, default #1E4078")
    args = parser.parse_args()

    n = SIZE * SCALE
    canvas = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle([0, 0, n - 1, n - 1], radius=16 * SCALE, fill=args.color)
    if args.text:
        text_glyph(draw, n, args.text)
    else:
        PICTURES[args.picture](draw, canvas, n)
    canvas.resize((SIZE, SIZE), Image.LANCZOS).save(args.output, optimize=True)
    print(f"wrote {args.output} ({SIZE}x{SIZE})")
    return 0


if __name__ == "__main__":
    sys.exit(main())

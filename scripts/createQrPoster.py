from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont


import os

OUT = Path(os.environ.get("POSTER_OUTPUT_PATH", "./qr-test-vocacional-ies11.png"))
URL = os.environ.get("APP_URL", "https://testvocacional.ies11.edu.ar")
W, H = 1600, 2200


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidate = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    return ImageFont.truetype(candidate, size)


canvas = Image.new("RGB", (W, H), "#edf8ff")
draw = ImageDraw.Draw(canvas)

# Institutional background paths.
draw.ellipse((W - 520, -240, W + 240, 520), fill="#bfe8ff")
draw.ellipse((-260, H - 460, 540, H + 260), fill="#d5f0ff")
draw.rounded_rectangle((90, 90, W - 90, H - 90), radius=72, fill="#ffffff", outline="#bfe8ff", width=4)

# Header.
draw.rounded_rectangle((180, 170, W - 180, 278), radius=38, fill="#102d54")
header = "EXPO EDUCATIVA 2026 · IES N.° 11"
header_box = draw.textbbox((0, 0), header, font=font(38, True))
draw.text(((W - (header_box[2] - header_box[0])) / 2, 201), header, font=font(38, True), fill="#ffffff")

# Big QR, with generous white quiet zone.
qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=18, border=5)
qr.add_data(URL)
qr.make(fit=True)
qr_img = qr.make_image(fill_color="#102d54", back_color="#ffffff").convert("RGB")
qr_img.thumbnail((1040, 1040), Image.Resampling.LANCZOS)
qr_card_size = 1110
qr_card = Image.new("RGB", (qr_card_size, qr_card_size), "#ffffff")
qr_card_draw = ImageDraw.Draw(qr_card)
qr_card_draw.rounded_rectangle((0, 0, qr_card_size - 1, qr_card_size - 1), radius=64, outline="#75cff7", width=8)
qr_card.paste(qr_img, ((qr_card_size - qr_img.width) // 2, (qr_card_size - qr_img.height) // 2))
canvas.paste(qr_card, ((W - qr_card_size) // 2, 360))

# Message.
title = "TU HISTORIA\nCOMIENZA AQUÍ"
title_font = font(102, True)
title_y = 1550
for line_index, line in enumerate(title.split("\n")):
    box = draw.textbbox((0, 0), line, font=title_font)
    draw.text(((W - (box[2] - box[0])) / 2, title_y + line_index * 118), line, font=title_font, fill="#102d54")

subtitle = "Test Vocacional del IES 11"
subtitle_box = draw.textbbox((0, 0), subtitle, font=font(58, True))
draw.text(((W - (subtitle_box[2] - subtitle_box[0])) / 2, 1810), subtitle, font=font(58, True), fill="#1976b7")

hint = "Escaneá el código y encontrá tu camino"
hint_box = draw.textbbox((0, 0), hint, font=font(40))
draw.text(((W - (hint_box[2] - hint_box[0])) / 2, 1910), hint, font=font(40), fill="#45647f")

# Visual endpoint / institutional signature.
draw.line((380, 2015, W - 380, 2015), fill="#bfe8ff", width=5)
footer = "IES N.° 11 · Jujuy"
footer_box = draw.textbbox((0, 0), footer, font=font(32, True))
draw.text(((W - (footer_box[2] - footer_box[0])) / 2, 2065), footer, font=font(32, True), fill="#102d54")

canvas.save(OUT, quality=95)
print(OUT)

# scripts/generate-og-image.py
from PIL import Image, ImageDraw, ImageFont
import os

width = 1200
height = 630

# Create image with deep slate / forest gradient
img = Image.new("RGB", (width, height), color=(15, 23, 42)) # Slate 900
draw = ImageDraw.Draw(img)

# Draw subtle gradient / top accent bar
for y in range(8):
    # Tricolor accent line: Saffron, White, Green
    if y < 3:
        color = (249, 115, 22) # Saffron
    elif y < 5:
        color = (255, 255, 255) # White
    else:
        color = (22, 163, 74) # Emerald Green
    draw.line([(0, y), (width, y)], fill=color, width=1)

# Subtle rounded inner card
card_box = [60, 60, width - 60, height - 60]
draw.rounded_rectangle(card_box, radius=24, fill=(30, 41, 59), outline=(51, 65, 85), width=2)

# Emerald highlight pill
pill_box = [100, 100, 420, 145]
draw.rounded_rectangle(pill_box, radius=12, fill=(6, 78, 59), outline=(16, 185, 129), width=2)

try:
    # Try system fonts
    font_bold_lg = ImageFont.truetype("arialbd.ttf", 54)
    font_bold_md = ImageFont.truetype("arialbd.ttf", 26)
    font_pill = ImageFont.truetype("arialbd.ttf", 20)
    font_regular = ImageFont.truetype("arial.ttf", 26)
    font_sm = ImageFont.truetype("arial.ttf", 20)
except Exception:
    font_bold_lg = ImageFont.load_default()
    font_bold_md = ImageFont.load_default()
    font_pill = ImageFont.load_default()
    font_regular = ImageFont.load_default()
    font_sm = ImageFont.load_default()

# Pill Text
draw.text((120, 112), "BHARAT LAND CONVERTER", font=font_pill, fill=(52, 211, 153))

# Main Title
draw.text((100, 180), "Indian Land Area Unit Converter", font=font_bold_lg, fill=(248, 250, 252))

# Subtitle
draw.text((100, 260), "Accurate Statutory & Customary Conversions Across All 36 States & UTs", font=font_bold_md, fill=(148, 163, 184))

# Unit tags box
units_text = "Bigha  •  Guntha  •  Acre  •  Hectare  •  Kanal  •  Marla  •  Cent  •  Ground  •  Kattha"
draw.rounded_rectangle([100, 325, width - 100, 385], radius=12, fill=(15, 23, 42), outline=(71, 85, 105), width=1)
draw.text((125, 342), units_text, font=font_bold_md, fill=(56, 189, 248))

# Feature bullets
draw.text((100, 425), "[+] State-wise statutory definitions (MLRC, UP Bhulekh, Banglarbhumi, Jamabandi)", font=font_regular, fill=(203, 213, 225))
draw.text((100, 465), "[+] Live interactive calculations with land valuation rate calculator", font=font_regular, fill=(203, 213, 225))
draw.text((100, 505), "[+] 100% Free, offline-ready, no login, zero tracking", font=font_regular, fill=(203, 213, 225))

# Footer Domain
draw.text((width - 390, height - 100), "https://land.ladestack.in", font=font_bold_md, fill=(52, 211, 153))

output_path = os.path.join("public", "og-image.png")
img.save(output_path, "PNG")
print(f"Generated {output_path} successfully ({os.path.getsize(output_path)} bytes)")


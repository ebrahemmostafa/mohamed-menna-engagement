import base64
from PIL import Image
import io

# Load the composite frame
frame = Image.open('assets/mm-frame-v3.png').convert('RGBA')

# Create a white background version for JPEG (since JPEG doesn't support transparency)
# Actually, we need to keep transparency. Let's compress PNG instead.
# Or better: save as WebP which is much smaller

# Save as compressed PNG
buf = io.BytesIO()
frame.save(buf, format='PNG', optimize=True)
png_data = buf.getvalue()
print(f"Compressed PNG size: {len(png_data)} bytes")

# Convert to base64
b64 = base64.b64encode(png_data).decode('ascii')
data_uri = f"data:image/png;base64,{b64}"
print(f"Base64 length: {len(data_uri)} chars")

# Read index.html and replace the background url
content = open('index.html', 'r', encoding='utf-8').read()
old_url = "url('assets/mm-frame-v3.png')"
new_url = f"url('{data_uri}')"
content = content.replace(old_url, new_url)
open('index.html', 'w', encoding='utf-8').write(content)
print("Done! Embedded frame as base64 in index.html")

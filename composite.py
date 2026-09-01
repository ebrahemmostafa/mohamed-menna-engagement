from PIL import Image

# Load the original frame (has vintage couple baked in)
frame = Image.open('assets/hero-frame-reference.png').convert('RGBA')
# Load the oval mask (alpha channel defines the oval shape)
mask_img = Image.open('assets/hero-oval-mask-reference.png').convert('RGBA')
# Load the new photo
photo = Image.open('assets/mohammed-menna-photo.jpeg').convert('RGBA')

# Resize mask to match frame size
mask_resized = mask_img.resize(frame.size, Image.LANCZOS)
# Get the alpha channel of the mask - this defines the oval area
oval_alpha = mask_resized.getchannel('A')

# Resize photo to match frame size, cropping to fit
# First figure out aspect ratios
fw, fh = frame.size
pw, ph = photo.size
frame_ratio = fw / fh
photo_ratio = pw / ph

if photo_ratio > frame_ratio:
    # Photo is wider - crop width
    new_h = ph
    new_w = int(ph * frame_ratio)
    left = (pw - new_w) // 2
    photo_cropped = photo.crop((left, 0, left + new_w, new_h))
else:
    # Photo is taller - crop height
    new_w = pw
    new_h = int(pw / frame_ratio)
    top = (ph - new_h) // 2
    photo_cropped = photo.crop((0, top, new_w, top + new_h))

photo_resized = photo_cropped.resize(frame.size, Image.LANCZOS)

# Create a version of the photo that only has pixels inside the oval
# (where mask alpha > 0)
photo_oval = Image.new('RGBA', frame.size, (0, 0, 0, 0))
photo_oval.paste(photo_resized, (0, 0))
# Apply the oval mask as alpha
photo_oval.putalpha(oval_alpha)

# Now composite: start with the photo in the oval, then paste the frame on top
# The frame's transparent areas will show the photo beneath
result = Image.new('RGBA', frame.size, (0, 0, 0, 0))
result.paste(photo_oval, (0, 0), photo_oval)
result = Image.alpha_composite(result, frame)

# Now remove the original couple from the oval area and replace with our photo
# Actually the above approach pastes photo UNDER the frame, but the frame
# still has the original couple in the oval. We need to:
# 1. Erase the oval area from the frame
# 2. Put our photo there instead

# Better approach: 
# Step 1: Create frame with oval area erased
frame_hollow = frame.copy()
frame_data = frame_hollow.load()
oval_data = oval_alpha.load()
for y in range(frame.height):
    for x in range(frame.width):
        if oval_data[x, y] > 128:  # Inside the oval
            r, g, b, a = frame_data[x, y]
            frame_data[x, y] = (r, g, b, 0)  # Make transparent

# Step 2: Composite photo (oval only) + hollow frame
result2 = Image.new('RGBA', frame.size, (0, 0, 0, 0))
result2 = Image.alpha_composite(result2, photo_oval)
result2 = Image.alpha_composite(result2, frame_hollow)

result2.save('assets/mohammed-menna-frame.png')
print('Done! Composite saved.')

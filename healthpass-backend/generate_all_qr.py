import os
import django
import qrcode

# --- Setup Django environment ---
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "healthpass_backend.settings")
django.setup()

# --- Import your Token model ---
from pharmacy.models import Token  # ← REPLACE <YOUR_APP_NAME> with your actual app folder name

# --- Create folder to save QR codes ---
output_folder = "qr_codes"
os.makedirs(output_folder, exist_ok=True)

# --- Generate QR codes for all tokens ---
tokens = Token.objects.all()
for token in tokens:
    token_id = str(token.id)
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(token_id)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    filename = os.path.join(output_folder, f"token_{token_id}.png")
    img.save(filename)
    print(f"QR code generated for token {token_id} → {filename}")

print("\n✅ All QR codes generated successfully in the 'qr_codes' folder!")

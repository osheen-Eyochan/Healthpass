# pharmacy_qr.py
import qrcode

consultation_id = 1
qr_data = str(consultation_id)  # Just the ID
img = qrcode.make(qr_data)
img.save(f"consultation_{consultation_id}_qr.png")
print(f"QR code saved as consultation_{consultation_id}_qr.png")

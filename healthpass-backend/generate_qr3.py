import qrcode

# Replace with the appointment ID you want
appointment_id = 3 

# Generate QR containing only the appointment ID
img = qrcode.make(str(appointment_id))

# Save as PNG
img.save(f"appointment_{appointment_id}_qr.png")

print(f"QR code saved as appointment_{appointment_id}_qr.png")

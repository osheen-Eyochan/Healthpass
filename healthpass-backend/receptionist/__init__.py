import qrcode

# Data to encode
appointment_id = 69
data = f"http://localhost:8000/api/receptionist/appointment/{appointment_id}"

# Create QR code
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4,
)
qr.add_data(data)
qr.make(fit=True)

# Generate image
img = qr.make_image(fill_color="black", back_color="white")

# Save image
img.save("appointment_69_qr.png")
print("QR code saved as appointment_69_qr.png")

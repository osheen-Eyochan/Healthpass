import qrcode

def generate_appointment_qr(appointment_id):
    # Encode only the appointment ID in the QR
    qr_data = f"appointment_id={appointment_id}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    
    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    filename = f"appointment_{appointment_id}_qr.png"
    img.save(filename)
    print(f"QR code generated and saved as {filename}")

# Example usage
if __name__ == "__main__":
    generate_appointment_qr(69)

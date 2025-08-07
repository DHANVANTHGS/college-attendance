import socket
import face_recognition
import numpy as np
import cv2
import base64

# Convert base64 image to OpenCV format
def decode_image(base64_str):
    img_bytes = base64.b64decode(base64_str)
    np_arr = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

# Compare two face images (OpenCV format)
def compare_faces(image1, image2):
    try:
        enc1 = face_recognition.face_encodings(image1)
        enc2 = face_recognition.face_encodings(image2)
        if not enc1 or not enc2:
            return "NO_FACE"
        result = face_recognition.compare_faces([enc1[0]], enc2[0])[0]
        return "MATCH" if result else "NO_MATCH"
    except Exception as e:
        return f"ERROR:{str(e)}"

# Start socket server
def start_socket_server(host='127.0.0.1', port=5001):
    print(f"[+] Facial Recognition Server Listening on {host}:{port}")
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind((host, port))
    server.listen(1)

    while True:
        client, addr = server.accept()
        print(f"[+] Connected from {addr}")

        data = b""
        while True:
            chunk = client.recv(4096)
            if not chunk:
                break
            data += chunk

        try:
            # Expect JSON string: { "live": "<base64>", "stored": "<base64>" }
            import json
            payload = json.loads(data.decode())
            img_live = decode_image(payload["live"])
            img_stored = decode_image(payload["stored"])
            result = compare_faces(img_live, img_stored)
        except Exception as e:
            result = f"ERROR:{str(e)}"

        client.sendall(result.encode())
        client.close()
        print(f"[✓] Response sent to {addr}: {result}")

if __name__ == "__main__":
    start_socket_server()

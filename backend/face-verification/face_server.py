import socket
import face_recognition
import numpy as np
import cv2
import base64
import json
from datetime import datetime

def decode_image(base64_str):
    try:
        img_bytes = base64.b64decode(base64_str)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        # Resize large images to improve performance
        if img.shape[0] > 1000 or img.shape[1] > 1000:
            img = cv2.resize(img, (0, 0), fx=0.5, fy=0.5)
            
        return img
    except Exception as e:
        print(f"Image decode error: {str(e)}")
        return None

def compare_faces(image1, image2):
    try:
        # Convert BGR to RGB (face_recognition uses RGB)
        rgb_img1 = cv2.cvtColor(image1, cv2.COLOR_BGR2RGB)
        rgb_img2 = cv2.cvtColor(image2, cv2.COLOR_BGR2RGB)
        
        # Find face locations and encodings
        enc1 = face_recognition.face_encodings(rgb_img1)
        enc2 = face_recognition.face_encodings(rgb_img2)
        
        if not enc1:
            return {"match": False, "reason": "NO_FACE_IN_STORED_IMAGE"}
        if not enc2:
            return {"match": False, "reason": "NO_FACE_IN_LIVE_IMAGE"}
            
        # Compare faces with tolerance
        distance = face_recognition.face_distance([enc1[0]], enc2[0])[0]
        match = distance < 0.6  # You can adjust this threshold
        
        return {
            "match": match,
            "distance": float(distance),
            "reason": "MATCH" if match else "NO_MATCH"
        }
    except Exception as e:
        return {"match": False, "reason": f"ERROR: {str(e)}"}

def handle_client(client_socket):
    try:
        data = b""
        while True:
            chunk = client_socket.recv(4096)
            if not chunk:
                break
            data += chunk

        payload = json.loads(data.decode())
        
        img_live = decode_image(payload["live"])
        img_stored = decode_image(payload["stored"])
        
        if img_live is None or img_stored is None:
            result = {"match": False, "reason": "IMAGE_DECODE_ERROR"}
        else:
            result = compare_faces(img_stored, img_live)
        
        response = json.dumps(result)
        client_socket.sendall(response.encode())
        
    except Exception as e:
        error_response = json.dumps({
            "match": False,
            "reason": f"PROCESSING_ERROR: {str(e)}"
        })
        client_socket.sendall(error_response.encode())
    finally:
        client_socket.close()

def start_socket_server(host='127.0.0.1', port=5001):
    print(f"[{datetime.now()}] Facial Recognition Server Listening on {host}:{port}")
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((host, port))
    server.listen(5)  # Allow multiple connections
    
    try:
        while True:
            client, addr = server.accept()
            print(f"[{datetime.now()}] Connection from {addr}")
            handle_client(client)
    except KeyboardInterrupt:
        print("\nShutting down server...")
    finally:
        server.close()

if __name__ == "__main__":
    start_socket_server()
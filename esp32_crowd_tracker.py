"""
=============================================================================
KEC FOOD COURT - ESP32-CAM AI CROWD DENSITY HARDWARE TRACKER
=============================================================================
This script streams frames from an ESP32-CAM hardware node, detects persons
using YOLOv8 (Class 0: person), calculates the live crowd congestion level,
and automatically synchronizes the real-time count with the KEC Food Court
Manager Dashboard via HTTP POST.

Requirements:
    pip install opencv-python requests numpy ultralytics
=============================================================================
"""

import time
import argparse
import cv2
import requests
import numpy as np
from ultralytics import YOLO

# Configuration
ESP32_IP = "http://10.79.86.13"  # Change to your ESP32-CAM IP from Arduino Serial Monitor
URL = f"{ESP32_IP}/capture"
API_ENDPOINT = "http://localhost:3000/api/crowd"

parser = argparse.ArgumentParser(description="KEC Food Court ESP32-CAM Crowd Counter")
parser.add_argument("--ip", default=ESP32_IP, help="ESP32-CAM Base URL (e.g. http://10.79.86.13)")
parser.add_argument("--api", default=API_ENDPOINT, help="KEC Food Court Backend API URL")
parser.add_argument("--headless", action="store_true", help="Run without opening GUI preview window")
parser.add_argument("--simulate", action="store_true", help="Simulate camera frames if hardware is offline")
args = parser.parse_args()

ESP32_IP = args.ip.rstrip('/')
URL = f"{ESP32_IP}/capture"
API_ENDPOINT = args.api

print("=" * 65)
print("  🚀 KEC FOOD COURT - AI HARDWARE CROWD TRACKER ACTIVE")
print("=" * 65)
print(f"  📷 Hardware Target: {URL}")
print(f"  🌐 Manager API:     {API_ENDPOINT}")
print(f"  🧠 AI Model:        YOLOv8 Nano (Person Detector)")
print("=" * 65)

model = YOLO('yolov8n.pt')
last_sync_time = 0
last_count = -1

while True:
    try:
        if args.simulate:
            # Create a blank simulation frame with moving synthetic boxes
            img = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(img, "ESP32-CAM SIMULATION MODE", (40, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)
            results = model(img, classes=[0], verbose=False)
            count = 4  # Default demo count
        else:
            resp = requests.get(URL, timeout=5)
            img_array = np.array(bytearray(resp.content), dtype=np.uint8)
            img = cv2.imdecode(img_array, -1)

            results = model(img, classes=[0], verbose=False) # 0 = person
            count = len(results[0].boxes)

        # Categorize crowd density
        if count <= 3:
            level = "LOW - Go now!"
            color = (0, 255, 0)
        elif count <= 8:
            level = "MEDIUM"
            color = (0, 255, 255)
        else:
            level = "HIGH - Wait"
            color = (0, 0, 255)

        current_time = time.time()
        # Push to KEC Manager Dashboard every 1.2 seconds or when count changes
        if current_time - last_sync_time >= 1.2 or count != last_count:
            last_sync_time = current_time
            last_count = count
            try:
                payload = {
                    "count": count,
                    "level": level,
                    "esp32_ip": ESP32_IP
                }
                res = requests.post(API_ENDPOINT, json=payload, timeout=2)
                if res.status_code == 200:
                    print(f"✅ Synced with Manager Dashboard -> People: {count} | Level: {level}")
                else:
                    print(f"⚠️ Server returned status {res.status_code}")
            except Exception as sync_err:
                print(f"📡 Web server not reachable at {API_ENDPOINT} ({sync_err})")

        # Show image with count if not headless
        if not args.headless and img is not None:
            annotated = results[0].plot() if not args.simulate else img
            cv2.putText(annotated, f"KEC Crowd: {level} ({count})", (14, 38), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
            cv2.putText(annotated, f"Hardware: {ESP32_IP}", (14, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)
            cv2.imshow("KEC Food Court - ESP32 CAM AI Crowd Monitor", annotated)

            if cv2.waitKey(1) == ord('q'):
                print("🛑 Stopping crowd tracker by user request.")
                break

    except Exception as e:
        print(f"⏳ Waiting for ESP32-CAM at {URL}... (Ensure IP is reachable on same Wi-Fi): {e}")
        time.sleep(2)

cv2.destroyAllWindows()

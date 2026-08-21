import sys
import time

import cv2
import requests
from ultralytics import YOLO


MODEL_PATH = "yolov8n.pt"
UPDATE_URL = "http://localhost:5000/api/intersections/CHN-001/update"
VEHICLE_CLASSES = {2, 3, 5, 7}  # car, motorcycle, bus, truck
UPDATE_INTERVAL_SECONDS = 2


def get_video_source():
    source = sys.argv[1] if len(sys.argv) > 1 else "traffic_feed.mp4"
    return int(source) if source.isdigit() else source


def detect_vehicles(model, frame):
    results = model(frame, verbose=False)
    return sum(
        1
        for result in results
        for box in result.boxes
        if int(box.cls[0]) in VEHICLE_CLASSES
    )


def send_vehicle_count(count):
    try:
        response = requests.post(
            UPDATE_URL,
            json={"vehicleCount": count},
            timeout=5,
        )
        response.raise_for_status()
        print(f"Sent vehicle count: {count}")
    except requests.RequestException as error:
        print(f"Could not send vehicle count: {error}")


def main():
    model = YOLO(MODEL_PATH)
    source = get_video_source()

    while True:
        capture = cv2.VideoCapture(source)
        if not capture.isOpened():
            print(f"Could not open video source: {source}")
            time.sleep(2)
            continue

        last_update = 0.0
        while True:
            success, frame = capture.read()
            if not success:
                break

            vehicle_count = detect_vehicles(model, frame)
            now = time.monotonic()
            if now - last_update >= UPDATE_INTERVAL_SECONDS:
                send_vehicle_count(vehicle_count)
                last_update = now

            cv2.imshow("NeuroTransit AI Traffic Detection", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                capture.release()
                cv2.destroyAllWindows()
                return

        capture.release()
        print("Video ended; restarting source")


if __name__ == "__main__":
    main()
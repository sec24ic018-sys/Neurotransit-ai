# Architecture

```mermaid
flowchart LR
  Sensors[ESP32 sensors] -->|MQTT| Backend[Express API]
  Detector[YOLOv8 detector] -->|HTTP traffic updates| Backend
  Backend -->|MQTT signals| Sensors
  Backend --> Firebase[(Firebase optional)]
  Browser[React dashboard] -->|REST| Backend
```

The backend owns intersection state, signal optimization, emergency corridor coordination, and analytics history. MQTT is optional for local development; the application continues with in-memory state when external services are unavailable.
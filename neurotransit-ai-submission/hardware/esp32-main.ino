#include <Arduino.h>

// Submission firmware entry point. Configure Wi-Fi and MQTT before flashing.
void setup() {
  Serial.begin(115200);
  Serial.println("NeuroTransit AI ESP32 ready");
}

void loop() {
  delay(1000);
}
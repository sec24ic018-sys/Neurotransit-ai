# Hardware Setup & Configuration Guide

## NeuroTransit AI - ESP32 Microcontroller Setup

### Overview

The hardware component uses ESP32 DevKit V1 microcontroller for real-time vehicle detection, signal optimization, and communication with the cloud backend via MQTT.

---

## Components Required

### Microcontroller
- **ESP32 DevKit V1** - Main processor
- **USB Cable** - For programming and power

### Sensors
- **2x IR Motion Sensors** - Vehicle detection
- **1x DHT22 Sensor** (optional) - Environmental data

### Actuators
- **3-Channel Relay Module** - Signal control
- **Traffic Light Assembly** - Red, Yellow, Green LEDs
- **Power Supply** - 5V, 2A minimum

### Additional Components
- **Breadboard** - Prototyping
- **Jumper Wires** - Connections
- **Resistors** - 10kΩ, 220Ω
- **Capacitors** - 100μF (optional)

---

## Pin Configuration

### ESP32 Pinout

```
ESP32 PIN MAPPING

Sensor Inputs:
- GPIO34 (ADC) - IR Sensor 1
- GPIO35 (ADC) - IR Sensor 2

Relay Control (Output):
- GPIO18 - Red Signal Relay
- GPIO19 - Yellow Signal Relay
- GPIO21 - Green Signal Relay

Serial Communication:
- GPIO1 (TX) - Serial TX
- GPIO3 (RX) - Serial RX

I2C (optional):
- GPIO22 (SCL) - I2C Clock
- GPIO21 (SDA) - I2C Data

Wi-Fi:
- Built-in 2.4GHz antenna
```

### Relay Module Connection

```
Relay Module to ESP32:
- VCC → 5V (Power Supply)
- GND → GND (Common Ground)
- IN1 → GPIO18 (Red Light)
- IN2 → GPIO19 (Yellow Light)
- IN3 → GPIO21 (Green Light)

Relay Outputs to Lights:
- Relay NO → Light Positive
- Relay GND → Light Negative
```

### Sensor Connection

```
IR Motion Sensor to ESP32:
- VCC → 5V
- GND → GND
- OUT → GPIO34/GPIO35 (ADC Input)

DHT22 (Optional) to ESP32:
- VCC → 3.3V
- GND → GND
- DATA → GPIO15 (with 10kΩ pull-up to VCC)
```

---

## Software Setup

### 1. Install Arduino IDE

1. Download from [arduino.cc](https://www.arduino.cc/en/software)
2. Install the application
3. Launch Arduino IDE

### 2. Install ESP32 Board Support

1. Go to **File → Preferences**
2. In "Additional Boards Manager URLs", add:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Click OK
4. Go to **Tools → Board → Boards Manager**
5. Search for "ESP32" and install by Espressif Systems
6. Click Close

### 3. Install Required Libraries

In **Sketch → Include Library → Manage Libraries**, install:
- **PubSubClient** (by Nick O'Leary) - MQTT communication
- **ArduinoJson** (by Benoit Blanchon) - JSON parsing
- **DHT sensor library** (by Adafruit) - For DHT22 sensor (optional)

### 4. Configure Arduino IDE for ESP32

1. Go to **Tools**
2. Set the following:
   - **Board**: ESP32 Dev Module
   - **Upload Speed**: 115200
   - **Flash Frequency**: 80 MHz
   - **Flash Mode**: DIO
   - **Flash Size**: 4MB (32Mb)

---

## Firmware Code

### Main Firmware: `esp32-signal-control.ino`

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Wi-Fi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Configuration
const char* mqtt_server = "test.mosquitto.org";
const int mqtt_port = 1883;
const char* mqtt_user = "username";
const char* mqtt_password = "password";

// Pin Configuration
#define RED_PIN 18
#define YELLOW_PIN 19
#define GREEN_PIN 21
#define SENSOR_1 34
#define SENSOR_2 35

// Variables
WiFiClient espClient;
PubSubClient client(espClient);
String deviceID = "ESP32-001";
int vehicleCount = 0;
int greenTime = 25;
int redTime = 35;
int yellowTime = 5;

// Function: Connect to Wi-Fi
void setupWiFi() {
  Serial.println();
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Failed to connect to WiFi");
  }
}

// Function: MQTT Reconnect
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    if (client.connect(deviceID.c_str(), mqtt_user, mqtt_password)) {
      Serial.println("connected");
      
      // Subscribe to signal updates
      String topic = "signals/control/" + deviceID;
      client.subscribe(topic.c_str());
      
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

// Function: MQTT Message Callback
void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);
  
  // Parse JSON
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message);
  
  if (!error) {
    greenTime = doc["greenTime"] | 25;
    redTime = doc["redTime"] | 35;
    Serial.print("Updated green time: ");
    Serial.println(greenTime);
  }
}

// Function: Read Vehicle Count from Sensors
int readVehicleCount() {
  int sensor1 = analogRead(SENSOR_1);
  int sensor2 = analogRead(SENSOR_2);
  
  // Convert analog values to vehicle count
  // Threshold: 2000 (adjust based on sensor calibration)
  int count = 0;
  if (sensor1 > 2000) count++;
  if (sensor2 > 2000) count++;
  
  return count * 10; // Scale for demo
}

// Function: Set Traffic Light
void setTrafficLight(int green, int yellow, int red) {
  // Green phase
  digitalWrite(GREEN_PIN, HIGH);
  digitalWrite(YELLOW_PIN, LOW);
  digitalWrite(RED_PIN, LOW);
  delay(green * 1000);
  
  // Yellow phase
  digitalWrite(GREEN_PIN, LOW);
  digitalWrite(YELLOW_PIN, HIGH);
  digitalWrite(RED_PIN, LOW);
  delay(yellow * 1000);
  
  // Red phase
  digitalWrite(GREEN_PIN, LOW);
  digitalWrite(YELLOW_PIN, LOW);
  digitalWrite(RED_PIN, HIGH);
  delay(red * 1000);
}

// Function: Publish Sensor Data
void publishSensorData() {
  StaticJsonDocument<256> doc;
  
  doc["deviceID"] = deviceID;
  doc["vehicleCount"] = vehicleCount;
  doc["greenTime"] = greenTime;
  doc["redTime"] = redTime;
  doc["timestamp"] = millis();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  String topic = "traffic/sensors/" + deviceID;
  client.publish(topic.c_str(), jsonString.c_str());
  
  Serial.print("Published: ");
  Serial.println(jsonString);
}

// Setup Function
void setup() {
  Serial.begin(115200);
  delay(100);
  
  Serial.println("\n\nNeuroTransit AI - ESP32 Starting");
  
  // Initialize pins
  pinMode(RED_PIN, OUTPUT);
  pinMode(YELLOW_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(SENSOR_1, INPUT);
  pinMode(SENSOR_2, INPUT);
  
  // Initialize lights to red
  digitalWrite(RED_PIN, HIGH);
  digitalWrite(YELLOW_PIN, LOW);
  digitalWrite(GREEN_PIN, LOW);
  
  // Setup Wi-Fi
  setupWiFi();
  
  // Setup MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

// Main Loop
void loop() {
  // Ensure MQTT connection
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Read vehicle count
  vehicleCount = readVehicleCount();
  
  // Publish sensor data every 5 seconds
  static unsigned long lastPublish = 0;
  if (millis() - lastPublish > 5000) {
    publishSensorData();
    lastPublish = millis();
  }
  
  // Control traffic light based on timing
  setTrafficLight(greenTime, yellowTime, redTime);
}
```

---

## Sensor Calibration

### IR Motion Sensor Calibration

1. **Setup**:
   - Place sensor at expected vehicle detection height
   - Open Serial Monitor (115200 baud)

2. **Calibration Code**:
   ```cpp
   void setup() {
     Serial.begin(115200);
     pinMode(SENSOR_1, INPUT);
   }
   
   void loop() {
     int value = analogRead(SENSOR_1);
     Serial.println(value);
     delay(100);
   }
   ```

3. **Determine Threshold**:
   - No vehicle: Record minimum value
   - Vehicle present: Record maximum value
   - Set threshold at ~70% of max value

---

## Testing & Validation

### 1. Serial Monitor Test

```
Connect ESP32 via USB
Open Serial Monitor (9600 baud)
Verify output:
- WiFi connection status
- MQTT connection status
- Sensor readings
- Published messages
```

### 2. MQTT Test with mosquitto_sub

```bash
# Subscribe to sensor data (from terminal)
mosquitto_sub -h test.mosquitto.org -t "traffic/sensors/ESP32-001"

# Should see JSON messages every 5 seconds
```

### 3. Signal Control Test

1. Manual publish to test signal updates:
```bash
mosquitto_pub -h test.mosquitto.org \
  -t "signals/control/ESP32-001" \
  -m '{"greenTime":40,"redTime":20}'
```

2. ESP32 should update timings and control lights

---

## Power Management

### Power Consumption
- **Idle State**: ~80mA
- **Wi-Fi Connected**: ~120mA
- **All Relays On**: ~300mA
- **Total (Max)**: ~400mA

### Power Supply Requirements
- **Voltage**: 5V DC
- **Current**: 2A minimum (for all relays + sensors)
- **Type**: USB adapter or external power supply

### Battery Backup (Optional)
- 5V Power Bank (10000mAh) for ~25 hours runtime

---

## Safety Considerations

### Electrical Safety
- Always disconnect power before rewiring
- Use proper relay module to avoid high-voltage contact
- Ensure proper grounding of all components

### Environmental Safety
- Waterproof enclosure for outdoor deployment
- Proper heat dissipation for continuous operation
- Surge protection for power lines

### Signal Safety
- Follow local traffic signal regulations
- Use pilot testing before production deployment
- Implement manual override capability

---

## Deployment Checklist

- [ ] ESP32 board successfully programmed
- [ ] Sensors calibrated and tested
- [ ] Wi-Fi connectivity verified
- [ ] MQTT connection working
- [ ] Traffic lights responding to commands
- [ ] Sensor data publishing correctly
- [ ] Emergency override tested
- [ ] Power supply verified
- [ ] Enclosure installed
- [ ] Network connectivity stable

---

## Troubleshooting

### Wi-Fi Connection Issues
```
Problem: Cannot connect to WiFi
Solution: 
- Verify SSID and password
- Check Wi-Fi signal strength
- Restart ESP32
- Update Arduino IDE and board drivers
```

### MQTT Connection Issues
```
Problem: MQTT connection fails
Solution:
- Verify MQTT broker address and port
- Check firewall settings
- Test with mosquitto_sub/pub from computer
- Verify credentials
```

### Sensor Not Detecting Vehicles
```
Problem: Serial monitor shows 0 vehicle count
Solution:
- Calibrate sensor threshold
- Check sensor wiring
- Verify sensor power supply
- Adjust sensor position
- Clean sensor lens
```

### Relay Not Switching Lights
```
Problem: Traffic lights not changing
Solution:
- Verify relay module wiring
- Test relay with multimeter
- Check GPIO pin connections
- Verify relay module power supply
- Test with simple blink sketch
```

---

## References

- [ESP32 Official Documentation](https://docs.espressif.com/projects/esp-idf/)
- [Arduino IDE Setup Guide](https://docs.arduino.cc/software/ide-v2/tutorials/getting-started)
- [MQTT Protocol](http://mqtt.org/)
- [PubSubClient Library](https://github.com/knolleary/pubsubclient)

---

**Last Updated**: August 16, 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅

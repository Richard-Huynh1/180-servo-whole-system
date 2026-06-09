#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <AsyncWebSocket.h>
#include <LittleFS.h>
#include <ESP32Servo.h>

#include "utils.h"
#include "secrets.h"

#define SERVO_PIN 6

Servo servo;

const int speed = 255;
double rightTurnReversePercentage = 0.25;
double leftTurnReversePercentage = 0.3;
bool headlightsIsOn = false;
bool rearLightsIsOn = false;

AsyncWebServer server(80);
AsyncWebSocket webSocket("/ws");

void dealWithMessage(String msg) {
  if (msg.length() > 0) {
    if (msg[0] == 'R') {
      rightTurnReversePercentage = msg.substring(1).toDouble() / 100;
      return;
    } else if (msg[0] == 'L') {
      leftTurnReversePercentage = msg.substring(1).toDouble() / 100;
      return;
    } else if (msg[0] == 'S') {
      servo.write(msg.substring(1).toInt());
      return;
    }
  }

  if (msg == "forward") {
    moveForward(speed);
  } else if (msg == "backward") {
    moveBackward(speed);
  } else if (msg == "left") {
    moveLeft(speed, leftTurnReversePercentage);
  } else if (msg == "right") {
    moveRight(speed, rightTurnReversePercentage);
  } else if (msg == "forwardLeft") {
    diagonalForwardLeft(speed);
  } else if (msg == "forwardRight") {
    diagonalForwardRight(speed);
  } else if (msg == "backwardLeft") {
    diagonalBackwardLeft(speed);
  } else if (msg == "backwardRight") {
    diagonalBackwardRight(speed);
  } else if (msg == "stopCar") {
    moveForward(0);
  } else if (msg == "headlights") {
    headlightsIsOn = !headlightsIsOn;
    toggleHeadlights(headlightsIsOn);
  } else if (msg == "rearLights") {
    rearLightsIsOn = !rearLightsIsOn;
    toggleRearLights(rearLightsIsOn);
  } else if (msg == "direction1") {
    thirdMotorDirection1();
  } else if (msg == "direction2") {
    thirdMotorDirection2();
  } else if (msg == "stopThirdMotor") {
    stopThirdMotor();
  } else {
    Serial.println("Message is not recognized: " + msg);
  }
}

// Actual webSocket code
void onWebSocketEvent(AsyncWebSocket* server, AsyncWebSocketClient* client, AwsEventType type, void* arg, uint8_t* payload, size_t length) {
  switch (type) {
    case WS_EVT_CONNECT:
      Serial.println("Client connected");
      break;
    case WS_EVT_DISCONNECT:
      Serial.println("Client disconnected");
      break;
    case WS_EVT_DATA:
      String msg = String((char*)payload); // Converts from bytes to chars
      Serial.printf("Received text: %s\n", msg);
      dealWithMessage(msg);
      break;
  }
}


void setup() {
  Serial.begin(115200);
  delay(2000);

  servo.attach(SERVO_PIN, 500, 2500);

  setupMotors();
  setupLights();
  servo.write(0);

  // Mounting File System
  Serial.println("Mounting LittleFS...");
  // format if filesystem not present
  if (!LittleFS.begin(true, "/littlefs", 10, "littlefs")) {
    Serial.println("LittleFS Mount Failed");
    return;
  }
  Serial.println("LittleFS Mounted!");

  // webSocket.begin();
  webSocket.onEvent(onWebSocketEvent);
  server.addHandler(&webSocket);

  // WiFi AP (Access Point)
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid, password);  // Starting Access Point mode, as opposed to WiFi.begin(ssid, password) for local network
  Serial.print("AP IP address: ");
  Serial.println(WiFi.softAPIP());  // serve as Access Point, not via local network with WiFi.LocalIP()

  server.serveStatic("/", LittleFS, "/").setDefaultFile("index.html");
  server.begin();

  Serial.println("Server turned on");
}

void loop() {
  webSocket.cleanupClients();
}

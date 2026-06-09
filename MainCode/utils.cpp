#include <Arduino.h>
#include "utils.h"

void toggleHeadlights(bool isOn) {
  digitalWrite(HEADLIGHTS_PIN, isOn ? HIGH : LOW);
}

void toggleRearLights(bool isOn) {
  digitalWrite(REAR_LIGHTS_PIN, isOn ? HIGH : LOW);
}

void setupLights() {
  pinMode(HEADLIGHTS_PIN, OUTPUT);
  pinMode(REAR_LIGHTS_PIN, OUTPUT);

  toggleHeadlights(false);
  toggleRearLights(false);
}

void setMotorPwm(int pin1, int pin2, int pwm) {
  pwm = constrain(pwm, -255, 255);

  if (pwm < 0) { // reverse
    ledcWrite(pin1, -pwm);
    ledcWrite(pin2, 0);
  }
  else if (pwm > 0) { // forward
    ledcWrite(pin1, 0);
    ledcWrite(pin2, pwm);
  }
  else { // stop
    ledcWrite(pin1, 0);
    ledcWrite(pin2, 0);
  }
}

void setupMotors() {
  ledcAttach(LEFT_MOTOR_PIN_1, PWM_FREQ, PWM_RES);
  ledcAttach(LEFT_MOTOR_PIN_2, PWM_FREQ, PWM_RES);

  ledcAttach(RIGHT_MOTOR_PIN_1, PWM_FREQ, PWM_RES);
  ledcAttach(RIGHT_MOTOR_PIN_2, PWM_FREQ, PWM_RES);

  pinMode(THIRD_MOTOR_PIN_1, OUTPUT);
  pinMode(THIRD_MOTOR_PIN_2, OUTPUT);

  setMotorPwm(LEFT_MOTOR_PIN_1, LEFT_MOTOR_PIN_2, 0);
  setMotorPwm(RIGHT_MOTOR_PIN_1, RIGHT_MOTOR_PIN_2, 0);
  stopThirdMotor();
}

void moveForward(int speed) {
  speed = constrain(speed, -255, 255);
  setMotorPwm(LEFT_MOTOR_PIN_1, LEFT_MOTOR_PIN_2, speed);
  setMotorPwm(RIGHT_MOTOR_PIN_1, RIGHT_MOTOR_PIN_2, speed);
}

void moveBackward(int speed) {
  moveForward(-speed);
}

void moveLeft(int speed, double reverseMotorPercent) {
  speed = constrain(speed, -255, 255);
  setMotorPwm(RIGHT_MOTOR_PIN_1, RIGHT_MOTOR_PIN_2, speed);
  setMotorPwm(LEFT_MOTOR_PIN_1, LEFT_MOTOR_PIN_2, -(int)floor(speed * reverseMotorPercent));
}

void moveRight(int speed, double reverseMotorPercent) {
  speed = constrain(speed, -255, 255);
  setMotorPwm(RIGHT_MOTOR_PIN_1, RIGHT_MOTOR_PIN_2, -(int)floor(speed * reverseMotorPercent));
  setMotorPwm(LEFT_MOTOR_PIN_1, LEFT_MOTOR_PIN_2, speed);
}

void diagonalForwardLeft(int speed) { 
  speed = constrain(speed, -255, 255);
  setMotorPwm(RIGHT_MOTOR_PIN_1, RIGHT_MOTOR_PIN_2, speed);
  setMotorPwm(LEFT_MOTOR_PIN_1, LEFT_MOTOR_PIN_2, (int)floor(-speed * 0.2));
}

void diagonalForwardRight(int speed) { 
  speed = constrain(speed, -255, 255);
  setMotorPwm(RIGHT_MOTOR_PIN_1, RIGHT_MOTOR_PIN_2, (int)floor(-speed * 0.2));
  setMotorPwm(LEFT_MOTOR_PIN_1, LEFT_MOTOR_PIN_2, speed);
}

void diagonalBackwardLeft(int speed) {
  diagonalForwardLeft(-speed);
}

void diagonalBackwardRight(int speed) {
  diagonalForwardRight(-speed);
}

void thirdMotorDirection1() {
  digitalWrite(THIRD_MOTOR_PIN_1, HIGH);
  digitalWrite(THIRD_MOTOR_PIN_2, LOW);
}

void thirdMotorDirection2() {
  digitalWrite(THIRD_MOTOR_PIN_1, LOW);
  digitalWrite(THIRD_MOTOR_PIN_2, HIGH);
}

void stopThirdMotor() {
  digitalWrite(THIRD_MOTOR_PIN_1, LOW);
  digitalWrite(THIRD_MOTOR_PIN_2, LOW);
}

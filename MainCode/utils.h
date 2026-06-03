#ifndef UTILS_H
#define UTILS_H

#define LEFT_MOTOR_PIN_1 8
#define LEFT_MOTOR_PIN_2 9

#define RIGHT_MOTOR_PIN_1 14
#define RIGHT_MOTOR_PIN_2 15

#define THIRD_MOTOR_PIN_1 18
#define THIRD_MOTOR_PIN_2 19

#define HEADLIGHTS_PIN 7
#define REARLIGHTS_PIN 0

#define PWM_FREQ 1000      // 1 kHz PWM
#define PWM_RES 8          // 8-bit resolution/motor speed range (0-255)

void toggleHeadlights(bool isOn);
void toggleRearlights(bool isOn);

void setupLights();

void setMotorPwm(int pin1, int pin2, int pwm);

void setupMotors();

void moveForward(int speed);
void moveBackward(int speed);

void moveLeft(int speed, double reverseMotorPercent);
void moveRight(int speed, double reverseMotorPercent);

void diagonalForwardLeft(int speed);
void diagonalForwardRight(int speed);

void diagonalBackwardLeft(int speed);
void diagonalBackwardRight(int speed);

void thirdMotorDirection1(int speed);
void thirdMotorDirection2(int speed);

#endif // UTILS_H

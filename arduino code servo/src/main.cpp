#include <Arduino.h>
#include <Servo.h>

Servo servo;
String inputString;
void setup() {
  Serial.begin(9600);
  servo.attach(9);
}

void loop() {
  if (Serial.available() > 0) {

    inputString = Serial.readStringUntil('\r');
    Serial.println(inputString);
    servo.write(inputString.toInt());
  }
}
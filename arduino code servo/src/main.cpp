#include <Arduino.h>
#include <Servo.h>

Servo servo;
Servo servo2;
String inputString;


void splitString(String data, float* result, int size) {
  int start = 0;
  int index = 0;
  for (int i = 0; i < data.length() && index < size; i++) {
    if (data.charAt(i) == ',') {
      result[index++] = data.substring(start, i).toFloat();
      start = i + 1;
    }
  }
  if (index < size) {
    result[index] = data.substring(start).toFloat();
  }
}

void setup() {
  Serial.begin(9600);
  servo.attach(5);
  servo2.attach(6);
}

void loop() {
  if (Serial.available() > 0) {
    inputString = Serial.readStringUntil('\r');
    
    float values[3];
    splitString(inputString, values, 3);

    servo.write(values[0]);
    servo2.write(values[1]);
  }
}

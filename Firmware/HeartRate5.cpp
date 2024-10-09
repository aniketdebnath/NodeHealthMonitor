#include "HeartRate5.h"
#include <Wire.h>
#include <Arduino.h>

// Constructor
SFH7072_HeartClick::SFH7072_HeartClick(uint8_t address) : _slaveAddress(address) {}

// Initialize I2C
void SFH7072_HeartClick::begin() {
    Wire.begin();
}

// Read a 24-bit register value
uint32_t SFH7072_HeartClick::readRegister(uint8_t reg) {
    uint8_t hr_storage[3];
    uint32_t returnValue = 0;

    Wire.beginTransmission(_slaveAddress);
    Wire.write(reg);
    if (Wire.endTransmission(false) != 0) {
#ifdef DEBUG
        Serial.println("I2C Error: Error during transmission");
#endif
        return 0xFFFFFFFF;
    }

    Wire.requestFrom(_slaveAddress, (uint8_t)3);
    if (Wire.available() == 3) {
        hr_storage[0] = Wire.read();
        hr_storage[1] = Wire.read();
        hr_storage[2] = Wire.read();

        returnValue = hr_storage[0];
        returnValue = (returnValue << 16) | (hr_storage[1] << 8) | hr_storage[2];
    }
    else {
#ifdef DEBUG
        Serial.println("Error: Not enough bytes available");
#endif
        return 0xFFFFFFFF;
    }

    return returnValue;
}

uint32_t SFH7072_HeartClick::calculateRegisterValue(float current_mA) {
    if (current_mA < 0 || current_mA > 50) {
        // Handle invalid current values
        return 0;
    }
    return static_cast<uint8_t>(current_mA / 0.8);
}

// Write a 24-bit value to a register
void SFH7072_HeartClick::writeRegister(uint8_t regAddr, uint32_t data) {
    Wire.beginTransmission(_slaveAddress);
    Wire.write(regAddr);
    Wire.write((data >> 16) & 0xFF);
    Wire.write((data >> 8) & 0xFF);
    Wire.write(data & 0xFF);
    Wire.endTransmission();
}

// Read sensor values
bool SFH7072_HeartClick::readSensor(uint16_t& led2Value, uint16_t& led1Value) {
    uint32_t led2Raw = readRegister(0x2A); // Example register for LED2 value
    uint32_t led1Raw = readRegister(0x2C); // Example register for LED1 value

    if (led2Raw == 0xFFFFFFFF || led1Raw == 0xFFFFFFFF) {
        return false;
    }

    led2Value = (uint16_t)(led2Raw & 0xFFFF);
    led1Value = (uint16_t)(led1Raw & 0xFFFF);
    return true;
}

// Initialize the sensor with default settings
void SFH7072_HeartClick::heartrate5_init() {
    // Default settings initialization
    writeRegister(0x00, 0x000000);
    writeRegister(0x01, 0x000050);
    writeRegister(0x02, 0x00018F);
    writeRegister(0x03, 0x000320);
    writeRegister(0x04, 0x0004AF);
    writeRegister(0x05, 0x0001E0);
    writeRegister(0x06, 0x00031F);
    writeRegister(0x07, 0x000370);
    writeRegister(0x08, 0x0004AF);
    writeRegister(0x09, 0x000000);
    writeRegister(0x0A, 0x00018F);
    writeRegister(0x0B, 0x0004FF);
    writeRegister(0x0C, 0x00063E);
    writeRegister(0x0D, 0x000198);
    writeRegister(0x0E, 0x0005BB);
    writeRegister(0x0F, 0x0005C4);
    writeRegister(0x10, 0x0009E7);
    writeRegister(0x11, 0x0009F0);
    writeRegister(0x12, 0x000E13);
    writeRegister(0x13, 0x000E1C);
    writeRegister(0x14, 0x00123F);
    writeRegister(0x15, 0x000191);
    writeRegister(0x16, 0x000197);
    writeRegister(0x17, 0x0005BD);
    writeRegister(0x18, 0x0005C3);
    writeRegister(0x19, 0x0009E9);
    writeRegister(0x1A, 0x0009EF);
    writeRegister(0x1B, 0x000E15);
    writeRegister(0x1C, 0x000E1B);
    writeRegister(0x1D, 0x009C3E);
    writeRegister(0x1E, 0x000103);
    writeRegister(0x20, 0x008003);
    writeRegister(0x21, 0x000003);
    writeRegister(0x22, 0x01B6D9);
    writeRegister(0x23, 0x104218);
    writeRegister(0x29, 0x000000);
    writeRegister(0x31, 0x000000);
    writeRegister(0x32, 0x00155F);
    writeRegister(0x33, 0x00991E);
    writeRegister(0x34, 0x000000);
    writeRegister(0x35, 0x000000);
    writeRegister(0x36, 0x000190);
    writeRegister(0x37, 0x00031F);
    writeRegister(0x39, 0x000000);
    writeRegister(0x3A, 0x000000);
    setAvgCount();
}

// Reset bits
// Perform a hardware reset (if necessary)
void SFH7072_HeartClick::heartrate5_hwReset() {
    // Implement hardware reset if necessary
}

// Perform a software reset
void SFH7072_HeartClick::heartrate5_swReset() {
    writeRegister(0x00, 0x0001); // Example software reset register
}

// LED Retrieval
// Get LED2 value
uint32_t SFH7072_HeartClick::heartrate5_getLed2val() {
    return readRegister(0x2A); // Example register for LED2 value
}

// Get ALED2 and LED3 values
uint32_t SFH7072_HeartClick::heartrate5_getAled2val_led3val() {
    return readRegister(0x2B); // Example register for ALED2/LED3 value
}

// Get LED1 value
uint32_t SFH7072_HeartClick::heartrate5_getLed1val() {
    return readRegister(0x2C); // Example register for LED1 value
}

// Get ALED1 value
uint32_t SFH7072_HeartClick::heartrate5_getAled1val() {
    return readRegister(0x2D); // Example register for ALED1 value
}

// Get LED2 and ALED2 value
uint32_t SFH7072_HeartClick::heartrate5_getLed2_aled2val() {
    return readRegister(0x3F); // Example register for LED2-ALED2 value
}

// Get LED1 and ALED1 value
uint32_t SFH7072_HeartClick::heartrate5_getLed1_aled1val() {
    return readRegister(0x40); // Example register for LED1-ALED1 value
}

// Set LED configuration
void SFH7072_HeartClick::heartrate5_setLedConfig(uint8_t led, float current_mA) {
    uint8_t currentCode = calculateRegisterValue(current_mA);
    Serial.print("Setting LED ");
    Serial.print((int)led);
    Serial.print(" to ");
    Serial.println(current_mA);

    // Configure register for LED current
    uint8_t registerValue = (currentCode & 0x3F); // Masking to 6 bits
    uint8_t shiftAmount = led * 6; // Determine shift amount based on LED number
    uint8_t registerAddress = 0x22; // Register for LED current settings

    // Read current value from the register
    uint32_t regValue = readRegister(registerAddress);

    // Clear the bits for the current LED
    regValue &= ~(0x3F << shiftAmount);

    // Set the new bits for the LED
    regValue |= (

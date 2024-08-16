#ifndef SFH7072_HEARTCLICK_H
#define SFH7072_HEARTCLICK_H

#include <Arduino.h>

class SFH7072_HeartClick {
public:
    // Constructor
    SFH7072_HeartClick(uint8_t address);

    // Initialize I2C
    void begin();

    // Read a 24-bit register value
    uint32_t readRegister(uint8_t reg);

    // Write a 24-bit value to a register
    void writeRegister(uint8_t regAddr, uint32_t data);

    // Calculate register value based on current
    uint32_t calculateRegisterValue(float current_mA);

    // Read sensor values
    bool readSensor(uint16_t& led2Value, uint16_t& led1Value);

    // Initialize the sensor with default settings
    void heartrate5_init();

    // Perform a hardware reset (if necessary)
    void heartrate5_hwReset();

    // Perform a software reset
    void heartrate5_swReset();

    // LED Retrieval functions
    uint32_t heartrate5_getLed2val();
    uint32_t heartrate5_getAled2val_led3val();
    uint32_t heartrate5_getLed1val();
    uint32_t heartrate5_getAled1val();
    uint32_t heartrate5_getLed2_aled2val();
    uint32_t heartrate5_getLed1_aled1val();

    // Set LED configuration
    void heartrate5_setLedConfig(uint8_t led, float current_mA);

private:
    uint8_t _slaveAddress;
};

#endif // SFH7072_HEARTCLICK_H

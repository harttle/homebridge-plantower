module.exports = function (Characteristic) {
    function co2(value) {
        return  value > 1000
            ? Characteristic.CarbonDioxideDetected.CO2_LEVELS_ABNORMAL
            : Characteristic.CarbonDioxideDetected.CO2_LEVELS_NORMAL
    }

    function voc(value) {
        if (value < 0.001) {
            return Characteristic.AirQuality.EXCELLENT;
        }
        else if (value < 0.08) {
            return Characteristic.AirQuality.GOOD;
        }
        else if (value < 1) {
            return Characteristic.AirQuality.INFERIOR;
        }
        return Characteristic.AirQuality.UNKNOWN;
    }

    function pm2_5(pm25) {
        if(pm25 <= 50) {
            return Characteristic.AirQuality.EXCELLENT;
        } else if(pm25 > 50 && pm25 <= 100) {
            return Characteristic.AirQuality.GOOD;
        } else if(pm25 > 100 && pm25 <= 200) {
            return Characteristic.AirQuality.FAIR;
        } else if(pm25 > 200 && pm25 <= 300) {
            return Characteristic.AirQuality.INFERIOR;
        } else if(pm25 > 300) {
            return Characteristic.AirQuality.POOR;
        } else {
            return Characteristic.AirQuality.UNKNOWN;
        }
    }
    return { co2, voc, pm2_5 };
}

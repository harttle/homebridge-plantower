var http = require('http');
//var Plantower = require('plantower');
var Plantower = require('./src/plantower');
var Accessory, Service, Characteristic, UUIDGen;

module.exports = function(homebridge) {
    console.log("homebridge API version: " + homebridge.version);
    // Accessory must be created from PlatformAccessory Constructor
    Accessory = homebridge.platformAccessory;

    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    // For platform plugin to be considered as dynamic platform plugin,
    // registerPlatform(pluginName, platformName, constructor, dynamic), dynamic must be true
    //homebridge.registerPlatform("homebridge-samplePlatform", "SamplePlatform", SamplePlatform, true);
    homebridge.registerAccessory("homebridge-plantower", "plantower", homebridgePlantower);
}

// Platform constructor
// config may be null
// api may be null if launched from old homebridge version
function homebridgePlantower(log, config, api) {
    log("homebridgePlantower Init");
    var platform = this;
    this.log = log;
    this.config = config;
    this.accessories = [];

    this.name = config['name'];
    this.model = config['model'];
    this.device = config['device'];

    this.pm2_5Service = new Service.AirQualitySensor('可吸入颗粒物', 'pm2.5')
    this.vocService = new Service.AirQualitySensor('甲醛', 'hcho')
    this.humidityService = new Service.HumiditySensor("湿度")
    this.temperatureService = new Service.TemperatureSensor("温度")


    this.plantower = new Plantower(this.model, this.device);
    setInterval(this.update.bind(this), 5000);
}

homebridgePlantower.prototype.update = function() {
    this.plantower.read().then(data => {
        this.humidityService.setCharacteristic(
            Characteristic.CurrentRelativeHumidity,
            data['humidity'].value
        );
        this.temperatureService.setCharacteristic(
            Characteristic.CurrentTemperature,
            data['temperature'].value
        );
        this.pm2_5Service.setCharacteristic(
            Characteristic.AirQuality,
            pm2_5Quality(data['concentration_pm2.5_normal'].value)
        );
        this.pm2_5Service.setCharacteristic(
            Characteristic.PM2_5Density,
            data['concentration_pm2.5_normal'].value
        );
        this.pm2_5Service.setCharacteristic(
            Characteristic.PM10Density,
            data['concentration_pm10_normal'].value
        );
        this.vocService.setCharacteristic(
            Characteristic.AirQuality,
			vocQuality(data['formaldehyde'].value)
        );
        this.vocService.setCharacteristic(
            Characteristic.VOCDensity,
			data['formaldehyde'].value * 1000
        );
    }).catch(console.error);
}

function vocQuality(value) {
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

function pm2_5Quality(pm25) {
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

homebridgePlantower.prototype.getServices = function() {
    return [this.humidityService, this.temperatureService, this.pm2_5Service, this.vocService]
}

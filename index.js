var http = require('http');
//var Plantower = require('plantower');
var Plantower = require('./src/plantower');
var Accessory, Service, Characteristic, UUIDGen, level;
var device = require('./src/device');
var Level = require('./level');

module.exports = function(homebridge) {
    console.log("homebridge API version: " + homebridge.version);
    // Accessory must be created from PlatformAccessory Constructor
    Accessory = homebridge.platformAccessory;

    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;
    level = Level(Characteristic);

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
    this.services = [];

    this.name = config['name'];
    this.model = config['model'];
    this.device = config['device'];

    Object.values(device[this.model].responseMap).forEach(field => {
        switch(field.key) {
            case 'humidity':
                this.services.push(this.humidityService = new Service.HumiditySensor("Humidity"));
                break;
            case 'temperature':
                this.services.push(this.temperatureService = new Service.TemperatureSensor("Temperature"));
                break;
            case 'concentration_pm2.5_normal':
                this.services.push(this.airService = new Service.AirQualitySensor('Air Quality', 'pm2.5'));
                break;
            case 'formaldehyde':
                this.services.push(this.vocService = new Service.AirQualitySensor('HCHO', 'hcho'));
                break;
            case 'co2':
                this.services.push(this.co2Service = new Service.CarbonDioxideSensor('CO2'));
                break;
        }
    });
    this.plantower = new Plantower(this.model, this.device);
    setInterval(this.update.bind(this), 5000);
}

homebridgePlantower.prototype.update = function() {
    this.plantower.read().then(data => {
        if (this.humidityService) {
            this.humidityService.setCharacteristic(
                Characteristic.CurrentRelativeHumidity,
                data['humidity'].value
            );
        }
        if (this.temperatureService) {
            this.temperatureService.setCharacteristic(
                Characteristic.CurrentTemperature,
                data['temperature'].value
            );
        }
        if (this.airService) {
            this.airService.setCharacteristic(
                Characteristic.AirQuality,
                level.pm2_5(data['concentration_pm2.5_normal'].value)
            );
            this.airService.setCharacteristic(
                Characteristic.PM2_5Density,
                data['concentration_pm2.5_normal'].value
            );
            this.airService.setCharacteristic(
                Characteristic.PM10Density,
                data['concentration_pm10_normal'].value
            );
        }
        if (this.vocService) {
            this.vocService.setCharacteristic(
                Characteristic.AirQuality,
                level.voc(data['formaldehyde'].value)
            );
            this.vocService.setCharacteristic(
                Characteristic.VOCDensity,
                data['formaldehyde'].value * 1000
            );
        }
        if (this.co2Service) {
            this.co2Service.setCharacteristic(
                Characteristic.CarbonDioxideLevel,
                data['co2'].value
            );
            this.co2Service.setCharacteristic(
                Characteristic.CarbonDioxideDetected,
                level.co2(data['co2'].value)
            );
        }
    }).catch(console.error);
}

homebridgePlantower.prototype.getServices = function() {
    return this.services;
}

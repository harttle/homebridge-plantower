# homebridge-plantower

Homebridge plugin for plantower sensors

Thanks [node-plantower](https://github.com/perfectworks/node-plantower), [homebridge-plantower](https://github.com/willnewii/homebridge-plantower)

## Installation

```bash
npm install -g homebridge
npm install -g homebridge-plantower
```

## Configuration

example `~/.homebridge/config.json`:

```json
{
    "bridge": {
        "name": "Pi with PMS5003ST",
        "username": "B8:27:EB:47:83:AA",
        "port": 51826,
        "pin": "012-52-222"
    },
    "accessories": [
        {
            "accessory": "plantower",
            "name": "PMS5003ST",
            "model":"PMS5003ST",
            "device":"/dev/ttyS0"
        }
    ]
}
```

## Models Supported

* DS_CO2_20
* PMS1003
* PMS3003
* PMS5003
* PMS5003I
* PMS5003P
* PMS5003S
* PMS5003ST
* PMS5003T
* PMS6003
* PMS7003
* PMS7003M
* PMS7003P
* PMSA003


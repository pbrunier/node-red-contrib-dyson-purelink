# Node RED dyson pure link

This Node RED module can control dyson purifier. (tested with dyson hot&cool pure link)

> Node-RED is a tool for wiring together hardware devices, APIs and online services in new and interesting ways.

## :question: Get Help

I'm always open for bug reports and feature requests, please open issues.

## :cloud: Installation

First of all install [Node-RED](http://nodered.org/docs/getting-started/installation)

```sh
$ sudo npm install -g node-red
# Then open  the user data directory  `~/.node-red`  and install the package
$ cd ~/.node-red
$ npm install node-red-contrib-dyson-purelink
```

Or search for dyson-purelink in the manage palette menu

Then run

```
node-red
```

## :yum: How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].

```sh
git clone https://github.com/pbrunier/node-red-contrib-dyson-purelink.git
cd node-red-contrib-dyson-purelink
npm install
gulp
cd ~/.node-red 
npm install /path/to/node-red-contrib-dyson-purelink
```

## :memo: Documentation

### Configuration:

- E-Mail: dyson E-Mail
- Password: dyson Password
- Country: Country-Code (US,DE,AT,GB,...)

<b>IMPORTANT:</b> Deploy the node, <b>before</b> searching for devices. 

### node explanation:

<b>INFO:</b> IF you know the IP address of the device, it better to use this. Instead bonjour auto-discovery will be used. Sometimes this is magically not working correctly. 

The action can be defined in the node properties or can be in the msg.payload.action.

Possible values are: 

- getTemperature
- getAirQuality
- getRelativeHumidity
- getFanStatus
- getFanSpeed
- getTemperatureTarget
- getJetFocus
- getNightModeStatus
- getRotationStatus
- getAutoOnStatus
- setRotation - rotation (true/false)
  {"action":"setRotation", "rotation": true}
- setRotationAngle - min_angle (5-355 degrees), max_angle (5-355 degrees)
  {"action":"setRotationAngle", "min_angle": 90, "max_angle": 270}
- setFanSpeed - speed in percent  
  { "action": "setFanSpeed","speed": "100" }
- BETA: setTemperatureTarget - Temperature target in degrees celcius (1-37 degrees)
  { "action": "setTemperatureTarget","temperatureTarget": "20" }
- setJetFocusOn
- setJetFocusOff
- setNightModeOn
- setNightModeOf
- setHeatOn
- setHeatOff
- turnOn
- turnOff
- getDeviceInfo (for support)

For the following actions some additonal parameters are mandatory:
- setRotation: msg.payload.rotation
- setRotationAngle: msg.payload.min_angle, msg.payload.max_angle
- setFanSpeed: msg.payload.speed
- BETA: setTemperatureTarget: msg.payload.temperatureTarget


### ExampleFlow:

![example][example_flow]

Download and import to NodeRED - [flow.json][example_flow_json]

## :scroll: The MIT License
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[example_flow]: ./examples/flow.png
[example_flow_json]: ./examples/flow.json

[contributing]: /CONTRIBUTING.md
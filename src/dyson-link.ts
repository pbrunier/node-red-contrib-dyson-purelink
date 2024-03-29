
import { Red, Node } from 'node-red';
import DysonPurelink, { findNetworkDevices } from './dysonpurelink/DysonPurelink';
import { Device } from './dysonpurelink/device';
import { debug } from 'console';
import { DysonCloud } from './dysonpurelink/dysonCloud';


export interface DysonNode extends Node {
    device: any;
    devicelink: any;
    action: any;
    value: any;
}

module.exports = function (RED: Red) {

    function sensorNode(config: any) {
        RED.nodes.createNode(this, config);
        let configNode = RED.nodes.getNode(config.confignode);
        if (!configNode) {
            this.error("Config is missing!")
            return;
        }
        let node = this;

        RED.httpAdmin.post("/dyson/authenticate", async (req, res) => {
            try {
                let dysonCloud = new DysonCloud(node,RED);
                let auth = await dysonCloud.authenticate(req.body.username, req.body.country);
                res.json(auth);
            } catch (e) {
                res.json(e);
                console.error(e);
            }
        });


        RED.httpAdmin.post("/dyson/verify", async (req, res) => {
            try {
                let dysonCloud = new DysonCloud(node,RED);
                let auth = await dysonCloud.verify(req.body.username, req.body.password, req.body.otp);
                res.json(req.body);
            } catch (e) {
                res.json(e);
                console.error(e);
            }
        });


        node.config = configNode;
        node.device = config.device;
        node.action = config.action;
        node.ip = config.ip;
        node.value = config.value;
        node.deviceserial = config.deviceserial;
        try {
            let pureLink = new DysonPurelink(node.config.username, node.config.password, node.config.country);
            pureLink.getDevices().then(cloud_devices => {
                if (!Array.isArray(cloud_devices) || cloud_devices.length === 0) {
                    return
                }

                cloud_devices.forEach(async (cloud_device: Device) => {
                    node.debug("Cloud_devices: " + JSON.stringify(cloud_device))
                    if (cloud_device.serial === node.deviceserial) {
                        if (!node.ip) {
                            let network_devices = await findNetworkDevices();

                            network_devices.forEach(network_device => {
                                node.debug("Network_device: " + JSON.stringify(network_device))
                                if (network_device.serial === node.deviceserial) {
                                    cloud_device.updateNetworkInfo(network_device);
                                    node.devicelink = cloud_device;
                                }
                            });
                        } else {
                            cloud_device.updateNetworkInfo({
                                ip: node.ip,
                                url: 'mqtt://' + node.ip,
                                port: 1883,
                                mqttPrefix: cloud_device._deviceInfo.ProductType,
                                productType: cloud_device._deviceInfo.ProductType
                            });
                            node.devicelink = cloud_device;
                        }
                        debug(`devicelink: ${node.devicelink}`)
                        if (!node.devicelink || !node.devicelink.ip || node.devicelink.ip <= 0) {
                            node.error("No dyson device found via bonjour service. Have you tried a direct IP address?")
                            return;
                        }
                        node.devicelink.connect('dyson_' + Math.random().toString(16));
                    }
                });
            });
        } catch (err) {
            node.error('Error: ' + err.message);
            node.status({ fill: "red", shape: "ring", text: err.message })
        }
        try {
            node.on('input', (msg) => {
                getStatus(msg, node, node.config);
            });
        }
        catch (err) {
            node.error('Error: ' + err.message);
            node.status({ fill: "red", shape: "ring", text: err.message })
        }

        node.on('close', () => {
            if (node.devicelink)
                node.devicelink.disconnect();
        });
    }

    function getStatus(msg: any, node: DysonNode, config: any) {
        let device: Device = node.devicelink;
        if (device) {
            let action = 'getFanStatus';
            if (msg.payload.action) {
                action = msg.payload.action
            } else if (node.action) {
                action = node.action
            }
            node.debug("action: " + action)
            switch (action) {
                case 'getDeviceInfo':
                    device.getDeviceInfo().then(t => node.send({ payload: { deviceInfo: t } }))
                    break;
                case 'getTemperature':
                    device.getTemperature().then(t => node.send({ payload: { temperature: t } }))
                    break;
                case 'getAirQuality':
                    device.getAirQuality().then(t => node.send({ payload: { air_quality: t } }))
                    break;
                case 'getRelativeHumidity':
                    device.getRelativeHumidity().then(t => node.send({ payload: { relative_humidity: t } }))
                    break;
                case 'getFanStatus':
                    device.getFanStatus().then(t => node.send({ payload: { fan_status: t } }))
                    break;
                case 'getFanSpeed':
                    device.getFanSpeed().then(t => node.send({ payload: { fan_speed: t } }))
                    break;
                case 'getJetFocus':
                    device.getJetFocus().then(t => node.send({ payload: { jet_focus: t } }))
                    break;
                case 'getNightModeStatus':
                    device.getNightmodeStatus().then(t => node.send({ payload: { night_mode: t } }))
                    break;
                case 'getRotationStatus':
                    device.getRotationStatus().then(t => node.send({ payload: { rotation: t } }))
                    break;
                case 'getRotationAngle':
                    // TODO BUG: PAYLOAD OBJECT NON-CONFORM
                    device.getRotationAngle().then(t => node.send({ payload: t }))
                    break;
                case 'getTemperatureTarget':
                    device.getTemperatureTarget().then(t => node.send({ payload: { temperatureTarget: t } }))
                    break;
                case 'getAutoOnStatus':
                    device.getAutoOnStatus().then(t => node.send({ payload: { auto_on: t } }))
                    break;
                case 'getSleepTimer':
                    device.getSleepTimer().then(t => node.send({ payload: { sleep_timer: t } }))
                    break;
                case 'setSleepTimer':
                    device.setSleepTimer(node.value || msg.payload.sleep_timer || 15).then(t => node.send({ payload: { sleep_timer: t } }))
                    break;
                case 'setAutoOnStatus':
                    device.setAuto(true).then(t => node.send({ payload: { auto_on: t } }))
                    break;
                case 'setAutoOffStatus':
                    device.setAuto(false).then(t => node.send({ payload: { auto_on: t } }))
                    break;
                case 'turnOn':
                    device.turnOn();
                    break;
                case 'turnOff':
                    device.turnOff();
                    break;
                case 'setNightModeOn':
                    device.setNightMode(true).then(t => node.send({ payload: { night_mode: t } }));
                    break;
                case 'setNightModeOff':
                    device.setNightMode(false).then(t => node.send({ payload: { night_mode: t } }));
                    break;
                case 'setHeatOn':
                    device.setHeat(true);
                    break;
                case 'setHeatOff':
                    device.setHeat(false);
                    break;
                case 'setTemperatureTarget':
                    device.setTemperatureTarget(node.value || msg.payload.temperatureTarget).then(t => node.send({ payload: { temperatureTarget: t } }));
                    break;
                case 'setRotation':
                    device.setRotation(node.value || msg.payload.rotation).then(t => node.send({ payload: { rotation: t } }))
                    break;
                case 'setRotationAngle':
                    device.setRotationAngle(msg.payload.min_angle, msg.payload.max_angle).then(t => node.send({ payload: t }))
                    break;
                case 'setFanSpeed':
                    device.setFanSpeed(node.value || msg.payload.speed).then(t => node.send({ payload: { fan_speed: t } }))
                    break;
                case 'setJetFocusOn':
                    device.setJetFocus(true).then(t => node.send({ payload: { jet_focus: t } }))
                    break;
                case 'setJetFocusOff':
                    device.setJetFocus(false).then(t => node.send({ payload: { jet_focus: t } }))
                    break;
            }
        }
    }

    RED.nodes.registerType("dyson-link", sensorNode);
}
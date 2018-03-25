/* MIT license */

var SPI = require('pi-spi');

var ledCount = 32,
    device = '/dev/spidev0.0',
    ChannelOrder = {
        "RGB": [0, 1, 2], // Probably not used, here for clarity
        "GRB": [1, 0, 2], // Strands from Adafruit and some others (default)
        "BRG": [1, 2, 0]  // Strands from many other manufacturers
    },
    c_order = ChannelOrder.GRB,
    masterBrightness = 1.0,
    buffer = [],
    gamma = new Buffer(256);


var LPD8806 = function (pLedCount, pDeviceName, pChannelOrder) {
    ledCount = pLedCount || ledCount;
    device = pDeviceName || device;
    c_order = pChannelOrder ? ChannelOrder[pChannelOrder] : ChannelOrder.GRB;

    this.spi = SPI.initialize(device);

    for (var i = 0; i < ledCount; i++) {
        buffer[i] = new Buffer([0x80, 0x80, 0x80]);
    }
    buffer.push(new Buffer([0x00, 0x00, 0x00]));
    buffer.push(new Buffer([0x00]));

    for (var g = 0; g < gamma.length; g++) {
        gamma[g] = 0x80 | Math.floor(Math.pow(g / 255, 2.5) * 127 + 0.5);
    }

    //Initialize the Complete RGB LED Strip
    this.update();
};

var __set_internal = function (pixel, color) {
    if (pixel < 0 || pixel >= ledCount ) {
        throw new Error('pixel number out of bounds');
    }
    buffer[pixel][c_order[0]] = gamma[~~(color.r * masterBrightness)];
    buffer[pixel][c_order[1]] = gamma[~~(color.g * masterBrightness)];
    buffer[pixel][c_order[2]] = gamma[~~(color.b * masterBrightness)];
};

LPD8806.prototype.setMasterBrightness = function (bright) {
    if (bright > 1.0 || bright < 0.0) {
        throw new Error('Brightness must be between 0.0 and 1.0');
    }
    masterBrightness = bright;
    return masterBrightness;
};

LPD8806.prototype.updateBrightness = function (bright) {
    this.setMasterBrightness(bright);

    for (var n = 0; n < ledCount; n++) {
        buffer[n][0] = gamma[~~(((buffer[n][0] > 128) ? buffer[n][0] : 0) * masterBrightness)];
        buffer[n][1] = gamma[~~(((buffer[n][1] > 128) ? buffer[n][1] : 0) * masterBrightness)];
        buffer[n][2] = gamma[~~(((buffer[n][2] > 128) ? buffer[n][2] : 0) * masterBrightness)];
    }
};

LPD8806.prototype.update = function() {
    new Promise(function(resolve, reject) {
        this.spi.write(Buffer.concat(buffer), function (error, data) {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    }.bind(this));
};

LPD8806.prototype.fill = function (color) {
    return this.fillRGB(color.r || 0, color.g || 0, color.b || 0);
};

LPD8806.prototype.fillRGB = function (r, g, b) {
    var pixel = ledCount;
    while (pixel--) {
        __set_internal(pixel, {r: r, g: g, b: b});
    }
    //Update the Stip after Updating the Buffer
    return this.update();
};

LPD8806.prototype.allOFF = function () {
    var pixel = ledCount;
    while (pixel--) {
        __set_internal(pixel, {r: 0, g: 0, b: 0});
    }
    //Update the Stip after Updating the Buffer
    return this.update();
};

LPD8806.prototype.setPixel = function (pixel, color) {
    __set_internal(pixel, color);
};

LPD8806.prototype.setPixelRGB = function (pixel, r, g, b) {
    __set_internal(pixel, {r: r, g: g, b: b});
};

LPD8806.prototype.setPixelOff = function (pixel) {
    __set_internal(pixel, {r: 0, g: 0, b: 0});
};

LPD8806.prototype.getLedCount = function () {
    return ledCount;
};

module.exports = LPD8806;
# lpd8806-promise

A promise based Node.js library that implements the LPD8806 protocol.

## Install

```
    npm install -O lpd8806-promise
```

I advice to install this library as optional dependency, so you can work with a mock on your development PC.

## Run

```
    var LPD8806 = require('lpd8806-promise');
    var ledstrip = new LPD8806(32, '/dev/spidev1.0'); // Number of LEDs/Pixels, Device

    //Available Funtions:

    ledstrip.fill({r: 0, g: 0: b: 255}); // Fill all Pixels with one color - parameter is an object
    ledstrip.fillRGB(0, 0, 255); // Fill all Pixels with one color - parameter are RED, GREEN, BLUE
    ledstrip.allOFF(); // Disable all Pixels

    ledstrip.setPixel(pixelNumber, {r: 0, g: 0: b: 255}); // Set a pixel in a special color
    ledstrip.setPixelRGB(pixelNumber, 0, 0, 255);
    ledstrip.setPixelOff(pixelNumber);
    // After you change all pixels like you want, you have to update the ledstripe. This sends the colors to the device
    ledstrip
        .update()
        .then(function(data){ console.log('updated') })
        .catch(function(error){ console.error(error) })

    // there is a way to apply brightness to all pixels
    ledstrip.updateBrightness(0.5); // needs a value between 0 and 1
    ledstrip.update(); // you need to update again after that
```

## Installing on Raspberry PI

First you need at least nodejs 0.12 to have native promise support. But I addvice you to install a recent version. Best way to install is [nvm](https://github.com/creationix/nvm). 

Second we need to enable the SPI-Driver. Currently you enable it in the `/boot/config.txt`. You can use this line for it:
```
    grep -q -- '^dtparam=spi=on$' "/boot/config.txt" || (echo "dtparam=spi=on" | sudo tee -a /boot/config.txt)
```
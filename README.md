### Control

- [x] The robot's dimensions
- [x] The robot's 3d orientation, translation, stance, and more

### Kinematics Solvers

- [x] Inverse Kinematics
- [x] Forward Kinematics

### Simulations

- [x] Ripple and tripod gait variations
- [x] Walking forward and backwards
- [x] Rotating clockwise and counterclockwise

### Platform 

### Raspberry Pi3 B+

#### 1. Update /etc/apt/source.list
  
  ```bash
  deb http://raspbian.melbourneitmirror.net/raspbian/  buster main contrib non-free rpi
  
  deb-src http://raspbian.raspberrypi.org/raspbian/ buster main contrib non-free rpi
  
  deb-src http://raspbian.raspberrypi.org/raspbian/ buster main contrib non-free rpi
  
  deb http://mirrordirector.raspbian.org/raspbian/ wheezy main contrib non-free rpi
  
  deb http://mirrordirector.raspbian.org/raspbian/ jessie main contrib non-free rpi

  ```
#### 2. Install required dependencies

```bash
$ sudo apt-get install build-essential git gcc-4.8 g++-4.8 && export CXX=g++-4.8 libusb-1.0-0 libusb-1.0-0-dev libudev-dev i2c-tools
```

#### 3. Install nvm

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash

$ source ~/.bashrc
```

#### 4. Prepare nodejs

```bash
nvm install 12.14.1
nvm use --delete-prefix v12.14.1
```

Verify installation 

```bash
$ node -v
v12.14.1

$ npm -v
6.14.7
```

Install serve forever

```bash
$ npm install -g forever

$ npm install -g forever-service

$ which npm
ls /home/pi/.nvm/versions/node/v12.14.1/bin/npm

$ sudo ln -s /home/pi/.nvm/versions/node/v12.14.1/bin/forever /usr/local/bin/forever

$ sudo ln -s /home/pi/.nvm/versions/node/v12.14.1/bin/forever-service /usr/local/bin/forever-service
```

Based on https://github.com/mithi/hexapod
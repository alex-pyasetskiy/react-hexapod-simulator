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
$ sudo apt-get update && sudo apt-get dist-upgrade -y

$ sudo apt-get install build-essential git gcc-4.8 g++-4.8 && export CXX=g++-4.8 libusb-1.0-0 libusb-1.0-0-dev libudev-dev i2c-tools libhidapi-hidraw0 lsb-core
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

$ sudo ln -s /home/pi/.nvm/versions/node/v12.14.1/bin/node /sbin/node
$ sudo ln -s /home/pi/.nvm/versions/node/v12.14.1/bin/npm /sbin/npm
```

$ sudo nano /etc/udev/rules.d/99-com.rules

```bash
SUBSYSTEM=="input", GROUP="input", MODE="0666"
SUBSYSTEM=="usb", ATTRS{idVendor}=="0xc21f", ATTRS{idProduct}=="0x046d", MODE:="666", GROUP="plugdev"
KERNEL=="hidraw*", ATTRS{idVendor}=="0xc21f", ATTRS{idProduct}=="0x046d", MODE="0666", GROUP="plugdev"
```


$ sudo udevadm control --reload-rules


```bash
sudo mkdir /opt/node
wget wget https://nodejs.org/dist/v12.18.3/node-v12.18.3-linux-armv7l.tar.gz
tar xvzf node-v12.18.3-linux-armv7l.tar.gz
sudo cp -r node-v12.18.3-linux-armv7l/* /opt/node
sudo nano /etc/profile
# add to file
NODE_JS_HOME="/opt/node"
PATH="$PATH:$NODE_JS_HOME/bin"
# ENDFILE
```

xboxdrv.service
```bash
# Systemd unit to enable xboxdrv driver for Xbox 360 controller
# Usage:
# save to /lib/systemd/system/xboxdrv.service
# to start: sudo service xboxdrv start
# to enable on boot: sudo systemctl enable xboxdrv

[Unit]
Description=Xbox controller driver daemon

[Service]
Type=forking
User=root
PIDFile=/var/run/xboxdrv.pid
ExecStart=/usr/bin/xboxdrv --daemon --detach --pid-file /var/run/xboxdrv.pid --dbus disabled --silent --mimic-xpad

[Install]
WantedBy=multi-user.target
```

```
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 40976EAF437D05B5
```

Try to run 'rmmod xpad' and then xboxdrv again or start xboxdrv with the option --detach-kernel-driver.


#### sudo nano /lib/systemd/system/xboxdrv.service

###### Requirements
+ evtest `sudo apt-get install evtest`



```bash
  GNU nano 3.2                     /lib/systemd/system/xboxdrv.service                               

# Systemd unit to enable xboxdrv driver for Xbox 360 controller
# Usage:
# save to /lib/systemd/system/xboxdrv.service
# to start: sudo service xboxdrv start
# to enable on boot: sudo systemctl enable xboxdrv

[Unit]
Description=Xbox controller driver daemon

[Service]
Type=forking
User=root
PIDFile=/var/run/xboxdrv.pid
ExecStart=/usr/bin/xboxdrv --daemon --detach --pid-file /var/run/xboxdrv.pid --dbus disabled --silen$

[Install]
WantedBy=multi-user.target
```
- `sudo systemctl daemon-reload`
- `sudo systemctl restart xboxdrv.service`


<Buffer 

| 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09       | 10 | 11  | 12 | 13        | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 |
|----|----|----|----|----|----|----|----|----------|----|-----|----|-----------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| b5 | d8 | 38 | 5f | 3b | fa | 03 | 00 | 01       | 00 | 33  | 01 | 00        | 00 | 00 | 00 | b5 | d8 | 38 | 5f | 3b | fa | 03 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 | 00 |
|    |    |    |    |    |    |    |    | BTN TYPE |    | BTN |    | BTN STATE |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |
>
- BUTTONS (bit 11 in hex):
  - BTN_A hex(33)

###### Resources:
 - https://github.com/pyenv/pyenv/wiki/Common-build-problems
 - https://websockets.readthedocs.io/en/stable/intro.html#
 - https://xboxdrv.gitlab.io/xboxdrv.html
 - https://launchpad.net/~grumbel/+archive/ubuntu/ppa
 - http://manpages.ubuntu.com/manpages/trusty/man1/evtest.1.html
 - https://gitlab.com/xboxdrv/xboxdrv
 - https://www.kernel.org/doc/Documentation/input/input.txt

Based on https://github.com/mithi/hexapod
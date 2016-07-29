const app = require('app');
const browserWindow = require('browser-window');

var mainWindow = null;
app.on('ready', function() {
    mainWindow = new browserWindow({
        height: 1080,
        width: 1920,
        frame: false,
    });
    mainWindow.loadURL('file://' + __dirname + '/environment.html');
});

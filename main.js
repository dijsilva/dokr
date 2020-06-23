const { app, Tray } = require('electron');
const TrayDocker = require('./lib/tray');

app.on('ready', async () => {
    new TrayDocker();
})
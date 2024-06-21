const { app, BrowserWindow } = require('electron');
const qrcode = require('qrcode');
const path = require("path");
require("dotenv").config();

const ipv4 = process.env.HOST_IPV4;
const PORTclient = process.env.CLIENT_PORT;

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const url = `http://${ipv4}:${PORTclient}`;
  qrcode.toDataURL(url, (err, dataUrl) => {
    if (err) {
      console.error(err);
      return;
    }

    win.loadURL(`data:text/html,
      <html>
        <body style="display:flex;justify-content:center;align-items:center;height:100%;margin:0;">
          <img src="${dataUrl}" alt="QR Code">
        </body>
      </html>`
    );
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

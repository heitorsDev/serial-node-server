const { app, BrowserWindow, ipcMain } = require("electron");
const qrcode = require("qrcode");
const path = require("path");
require("dotenv").config();

const ipv4 = process.env.HOST_IPV4;
const PORTclient = process.env.CLIENT_PORT;

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, 
    },
  });
  win.loadFile("dashboard.html");
  const url = `http://${ipv4}:${PORTclient}`;
  qrcode.toDataURL(url, (err, dataUrl) => {
    if (err) {
      console.error(err);
      return;
    }
    win.webContents.send("wsurl", `ws://${ipv4}:${PORTclient}`);
    win.webContents.send("qrcode", dataUrl);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

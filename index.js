const { v4: uuidv4 } = require("uuid");
const express = require("express");
const path = require("path");
const app = express();
const WebSocket = require("ws");
const http = require("http");
const { SerialPort } = require("serialport");
require("dotenv").config();
const { spawn } = require('child_process');
const electron = require('electron');

const portInput = process.env.COM_PORT;
const port = new SerialPort({
  path: portInput,
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: "none",
});

port.on('readable', function () {
  console.log('Data:', port.read());
});

port.on("open", () => {
  console.log("serial port connected");
});

let lastData = null;

port.on("data", (data) => {
  if (data !== lastData) {
    console.log(`serial data: ${data}`);
    lastData = data;
  }
});

const ipv4 = process.env.HOST_IPV4;
const PORTclient = process.env.CLIENT_PORT;

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/wsurl", (req, res) => {
  res.json({
    wsurl: `ws://${ipv4}:${PORTclient}`
  });
});



server.listen(PORTclient, ipv4, () => {
  console.log(`client: http://${ipv4}:${PORTclient}`);
  console.log(`ws: ws://${ipv4}:${PORTclient}`);
  const electronPath = electron;
  const child = spawn(electronPath, [path.join(__dirname, 'qrcode.js')]);
});

wss.on("connection", (ws) => {
  const clientID = uuidv4();
  ws.clientID = clientID;
  console.log("connected client");

  ws.on("message", (message) => {
    console.log(`received message: ${message} | id: ${ws.clientID}`);
    port.write(message);
  });

  ws.on("close", () => {
    console.log("disconnected client");
  });
});

const { v4: uuidv4 } = require("uuid");
const express = require("express");
const path = require("path");
const app = express();
const WebSocket = require("ws");
const http = require("http");
const { SerialPort } = require("serialport");
require("dotenv").config();
const { spawn } = require("child_process");
const electron = require("electron");

function map(x, in_min, in_max, out_min, out_max) {
  return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

const portInput = process.env.COM_PORT;
const port = new SerialPort({
  path: portInput,
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: "none",
});

port.on("readable", function () {
  //console.log('Data:', port.read());
});

port.on("open", () => {
  console.log("serial port connected");
});

let lastData = null;

port.on("data", (data) => {
  if (data !== lastData) {
    //console.log(serial data: ${data});
    lastData = data;
  }
});

const visualizerPort = process.env.VISUALIZER_PORT;
const ipv4 = process.env.HOST_IPV4;
const PORTclient = process.env.CLIENT_PORT;

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/handtracking", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "handtracking.html"));
});

app.get("/visualizer", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "visualizer.html"));
});

app.get("/wsurl", (req, res) => {
  res.json({
    wsurl: `ws://${ipv4}:${PORTclient}`,
  });
});

server.listen(PORTclient, ipv4, () => {
  console.log(`client: http://${ipv4}:${PORTclient}`);
  console.log(`ws: ws://${ipv4}:${PORTclient}`);
  const electronPath = electron;
  const child = spawn(electronPath, [path.join(__dirname, "qrcode.js")]);
});

wss.on("connection", (ws) => {
  const clientID = uuidv4();
  ws.clientID = clientID;
  console.log("connected client");

  ws.on("message", (message) => {
    console.log(`received message: ${message} | id: ${ws.clientID}`);

    wss.clients.forEach(function each(client) {
      if (client.clientID !== clientID) {
        client.send(`${message}`);
      }
    });
    let json = JSON.parse(message)
    let float = parseFloat(json.distance4to8);
    let out = map(float, 0, 0.5, 0, 180)
    port.write(`${out}\r`);
    console.log(`${out}\n`);
  }
);


});

wss.on("close", () => {
  console.log("disconnected client");
});

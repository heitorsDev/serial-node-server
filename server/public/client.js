let ws = null;
let wsVisualizer = null;
function connectWebSocket(url) {
  ws = new WebSocket(url);
  ws.onopen = () => {
    console.log("connected");
    handleConnected();
  };
  ws.onclose = () => {
    console.log("disconnected");
    handleDicsonnected();
  };
  ws.onmessage = (event) => {
    console.log(event.data);
    setMessageReceived(event.data);
  };
}


function sendInput(str) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(str);
  }
}
function sendImage() {
  canvasElement.toBlob((blob) => {
    if (blob) {
      blob.arrayBuffer().then(buffer => {
        wsVisualizer.send(buffer);
      });
    }
  });
}
//DOM
const connectButton = document.getElementById("connectButton");
const statusDiv = document.getElementById("statusDiv");
const textInput = document.getElementById("textInput");
const sendButton = document.getElementById("sendButton");
const messageDiv = document.getElementById("messageDiv");


function handleConnectWs() {
  fetch("/wsurl")
    .then((response) => response.json())
    .then((data) => {
      connectWebSocket(data.wsurl);
    });
}

function createConnections(){
  handleConnectWs()
}


function handleSend() {
  if (ws != null) {
    sendInput(textInput.value);
  }
}

function handleConnected() {
  statusDiv.innerHTML = "connected";
}
function handleDicsonnected() {
  statusDiv.innerHTML = "disconnected";
}
function setMessageReceived(message) {
  messageDiv.innerHTML = message;
}

//handtracking
const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("output");
const canvasCtx = canvasElement.getContext("2d");
const x8 = document.getElementById("x8");


const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 640,
  height: 480,
});
camera.start();

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  if (results.image) {
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
  }
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 5,
      });
      drawLandmarks(canvasCtx, landmarks, {
        color: "#FF0000",
        lineWidth: 2,
      });
      const point4 = landmarks[4];
      const point8 = landmarks[8];
      canvasCtx.beginPath();
      canvasCtx.moveTo(point4.x * canvasElement.width, point4.y * canvasElement.height);
      canvasCtx.lineTo(point8.x * canvasElement.width, point8.y * canvasElement.height);
      canvasCtx.strokeStyle = "#FF0000";
      canvasCtx.lineWidth = 2;
      canvasCtx.stroke();
    }

  }
  canvasCtx.restore();
  sendHandData(results.multiHandLandmarks);
}

function sendHandData(landmarks) {
  if (landmarks && landmarks.length > 0) {
    let mediax1 = 0;
    let mediay1 = 0;
    let mediaz1 = 0;

    for (let i = 0; i < landmarks[0].length - 1; i++) {
      mediax1 += landmarks[0][i].x;
      mediay1 += landmarks[0][i].y;
      mediaz1 += landmarks[0][i].z;
    }
    mediax1 /= landmarks[0].length;
    mediay1 /= landmarks[0].length;
    mediaz1 /= landmarks[0].length;


    if (landmarks[1]) {
      let mediax2 = 0;
      let mediay2 = 0;
      let mediaz2 = 0;
      for (let i = 0; i < landmarks[1].length - 1; i++) {
        mediax2 += landmarks[1][i].x;
        mediay2 += landmarks[1][i].y;
        mediaz2 += landmarks[1][i].z;
      }
      mediax2 /= landmarks[1].length;
      mediay2 /= landmarks[1].length;
      mediaz2 /= landmarks[1].length;
      let diffx = mediax2-mediax1
      let diffy = mediay2-mediay1
      let diffz = mediaz2-mediaz1
    }
    let angle = Math.atan2(landmarks[0][0].y - landmarks[0][8].y, landmarks[0][0].z - landmarks[0][8].z);
    angle*=(180/Math.PI)
    let distance48 = Math.sqrt(Math.pow(landmarks[0][4].x-landmarks[0][8].x, 2)+Math.pow(landmarks[0][4].y-landmarks[0][8].y, 2))
    let angle48 = Math.atan2(landmarks[0][4].x - landmarks[0][8].x, landmarks[0][4].y - landmarks[0][8].y);
    angle48*=(180/Math.PI)
    
    let out = {
      angleHand: angle.toFixed(0),
      distance4to8: distance48.toFixed(2),
      angle4to8: angle48.toFixed(0)
    }
    sendInput(JSON.stringify(out))
    console.log(out)
  }}
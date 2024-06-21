
let ws = null;
function connectWebSocket(url) {
  ws = new WebSocket(url);
  ws.onopen = () => {
    console.log("connected")
    handleConnected()
  };
  ws.onclose = () => {
    console.log("disconnected")
    handleDicsonnected()
  };
  ws.onmessage = (event) => {
    console.log(event.data);
    setMessageReceived(event.data)
  };
}


function sendInput(str) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(str);
  }
}

//DOM
const connectButton = document.getElementById("connectButton")
const statusDiv = document.getElementById("statusDiv")
const textInput = document.getElementById("textInput")
const sendButton = document.getElementById("sendButton")
const messageDiv = document.getElementById("messageDiv")

function handleConnectWs(){
  fetch("/wsurl")
      .then(response => response.json())
      .then(data => {
          connectWebSocket(data.wsurl);
      })
}

function handleSend(){
    if (ws!=null){
        sendInput(textInput.value)
    }
}

function handleConnected(){
    statusDiv.innerHTML = "conectado"
}
function handleDicsonnected(){
    statusDiv.innerHTML = "desconectado"
}
function setMessageReceived(message){
    messageDiv.innerHTML = message

}

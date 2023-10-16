require('dotenv').config();
const express = require('express');
const expressWs = require('express-ws')(express()); 
const cors = require('cors'); 
const WebSocket = require("ws"); 

const app = expressWs.app; 
const wss = expressWs.getWss(); 

app.use(express.json());
app.use(cors());  

app.ws('/websocket', (ws, req) => {

  console.log('WebSocket connected');
  ws.on('message', (message) => {
    console.log('Received message:', message);

    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('WebSocket disconnected');
  });
});


const apiRouter = require("./routes/api-router");
app.use("/api", apiRouter)

app.all("*", (req, res) => {
  res.status(404).send({ status: 404, msg: "Not Found" });
});

  app.use((err, req, res, next) => {
    if (err.status && err.msg) {
      res.status(err.status).send({ msg: err.msg });
    }
    return next(err);
  });


module.exports = {app}; 












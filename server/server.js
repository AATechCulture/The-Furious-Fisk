const express = require('express');
const app = express();
const cors = require("cors");
const { Server } = require("socket.io");
const http = require('http');

// Middleware to parse JSON request bodies
// app.use(express.json());
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});


io.on("connection", (socket) => {
    console.log(`User joined room: ${socket.id}`);
    
    socket.on("message", (data)=> {
        // socket.join(socket.id);
        // console.log(`User joined room: ${socket.id}`);
        console.log(data);
    })
    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    })
})


const port = 4001;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
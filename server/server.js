// const express = require('express');
// const app = express();
// const cors = require("cors");
// const { Server } = require("socket.io");
// const http = require('http');

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import 'openai';

import OpenAIApi from 'openai';
import Configuration from 'openai';
import dotenv from 'dotenv'
dotenv.config();

const app = express();
// Middleware to parse JSON request bodies
// app.use(express.json());
app.use(cors());
const server = http.createServer(app);


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);



// async function main(){
//     const chatCompletion = await openai.chat.completions.create({
//         model: 'gpt-3.5-turbo',
//         messages: [
//             {
//                 role: 'user', content:'what is the capital of Massachusetts'
//             }
//         ]
//     });
//     console.log(chatCompletion.choices[0]);
// }

// main()



const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});


async function isBookingRequest(text) {
    const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'user', content:`Is the following text desiring for a airplane ticket. Give the answer in either True or False. "${text}"`
            }
        ]
    });
    console.log(chatCompletion.choices[0]);
}


io.on("connection", (socket) => {
    console.log(`User joined room: ${socket.id}`);
    socket.on("message", (data)=> {
        // socket.join(socket.id);
        // console.log(`User joined room: ${socket.id}`);
        let text = "Give me a flight from Dallas to Nashville for Nov 5"
        console.log(data);
        let bookingRequest = isBookingRequest(text);
        
    })
    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    })
})


const port = 4001;

server.listen(port, () => {

    let text = "Give me a flight from Dallas to Nashville for Nov 5";
    isBookingRequest(text);
    console.log(`Server is running on port ${port}`);
});
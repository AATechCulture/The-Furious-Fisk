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



let bookinginfo = {
    "oneway": null,
    "origin": "",
    "destination": "",
    "depart_date": "", 
    "return_date": "",
    "no_of_passengers": "" 
}





const app = express();
// Middleware to parse JSON request bodies
// app.use(express.json());
app.use(cors());
const server = http.createServer(app);


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);


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
                role: 'user', content:`Is the following text desiring for a flight ticket. Give the answer in either True or False. "${text}"`
            }
        ]
    });
    return chatCompletion.choices[0];
}

async function getInitialInfo(text) {
    const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'user', content:`Give me a python dictionary with fields origin, destination, date with the following sentence."${text}"`
            }
        ]
    });
    return chatCompletion.choices[0];
}




io.on("connection", (socket) => {
    socket.on("message", async (data)=> {
        socket.join(socket.id);
        // console.log(`User joined room: ${socket.id}`);
        console.log("here");
        const bookingRequest = await isBookingRequest(data);
        if (bookingRequest.message.content){
            const initialInfo = await getInitialInfo(data);
            console.log(initialInfo);
            for(var i in initialInfo){
                bookinginfo[i] = initialInfo[i];
            }
            console.log(bookinginfo);
        }
    })
    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    })
})


const port = 4001;

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
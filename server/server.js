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

let bookinginfo_arr = []

for (let info in bookinginfo){
    bookinginfo_arr.push(info)
}
// console.log(bookinginfo_arr);





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
                role: 'user', content:`Give me a JSON with fields ticketdesire and roundtrip with values as either true or false by analyzing the following text to see if there is a desire for a ticket and if there is a desire for roundtrip and return only the JSON as answer. "${text}"`
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
                role: 'user', content:`Give me a JSON with fields origin, destination, depart_date with the following sentence and return the dictionary as the only answer. Add one more field return date if the return date is also mentioned. Add one more field no_of_passengers if the number of passengers are also mentioned. Return just the JSON as answer."${text}"`
            }
        ]
    });
    return chatCompletion.choices[0];
}




io.on("connection", (socket) => {
    socket.on("message", async (data)=> {
        socket.join(socket.id);
        // console.log(`User joined room: ${socket.id}`);

        let bookingRequest = await isBookingRequest(data);
        bookingRequest = JSON.parse(bookingRequest.message.content);
        if (bookingRequest["roundtrip"] == true){
            bookinginfo["oneway"] = false
        } else {
            bookinginfo["oneway"] = true
        }

        // Handling the oneway trip and twoway trip

        console.log(bookingRequest);
        if (bookingRequest["ticketdesire"]){
            let initialInfo = await getInitialInfo(data);
            // console.log(initialInfo);
            initialInfo = JSON.parse(String(initialInfo.message.content));
            console.log(initialInfo);
            for(let i in initialInfo){
                bookinginfo[i] = initialInfo[i];
            }  
            console.log(bookinginfo);
        }



        // Now check for no of passengers 
        if (bookinginfo["no_of_passengers"] == ""){
            socket.emit("message", "Please enter the number of passengers for the flight.")
        }
    })
    socket.on("no_of_pas", (data) => {
        bookinginfo["no_of_passengers"] = parseInt(data)
        console.log(bookinginfo);
    })
    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    })
})


const port = 4001;

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
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
import axios from 'axios';
import { jsonc } from 'jsonc';

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


function parseDate(date){
    const date1 = new Date(date);
    const year = date1.getFullYear();
    const month = String(date1.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so add 1 and pad with zeros.
    const day = String(date1.getDate()).padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}`;
    // console.log(formattedDate);
    return formattedDate;
}



async function fetchFlights(date) {

    const apiUrl = 'http://localhost:4000/';

    const destination = "DFW";

    try {
      const response = await axios.get(`${apiUrl}flights`, {
        params: {
            date
        }
      });

  
      // Process the response here, for example, log it to the console
    //   console.log('API Response:', response);
    // console.log(typeof(response));
      
    //   let response_values = Object.values(response.data);
    //   response_values = JSON.parse(response.data);

      let len = response.data.length

      let flights = []



      for(let i = 0; i < 3; i++){
        let indv_flights = {}
        indv_flights['flightNumber'] = response.data[i].flightNumber;
        indv_flights['origin'] = response.data[i].origin.city;
        indv_flights['destination'] = response.data[i].destination.city;
        indv_flights['duration'] = response.data[i].duration.locale;
        let departure_time = new Date(response.data[i].departureTime);
        let arrival_time = new Date(response.data[i].arrivalTime);


        indv_flights['departureTime'] = departure_time.toLocaleString('en-US')
        indv_flights['arrivalTime'] = arrival_time.toLocaleString('en-US');   
         
        function getRandomIntInRange(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
          }
          
          const min = 300; // Minimum value of the range
          const max = 400; // Maximum value of the range
          
          const randomInt = getRandomIntInRange(min, max);
          indv_flights['price'] = randomInt;          

        

        // const date = new Date(indv_flights['departureTime']);
        // const options = {
        //   year: 'numeric',
        //   month: 'long',
        //   day: 'numeric',
        //   hour: 'numeric',
        //   minute: 'numeric',
        //   hour12: true,
        //   timeZoneName: 'short',
        //   timeZone: 'short',
        // };
        flights.push(indv_flights);
        
        // const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
        
        // console.log(formattedDate);
        // console.log(date);
        
        
        // console.log(indv_flights);
        // console.log('\n\n\n')
        

      }
      return flights

      


      



      
    } catch (error) {
      // Handle any errors that may occur during the request
      console.error('Error:', error);
    }
  }


 
  




io.on("connection", (socket) => {
    socket.on("message", async (data)=> {
        // socket.join(socket.id);
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
            // console.log(initialInfo);
            for(let i in initialInfo){
                bookinginfo[i] = initialInfo[i];
            }  
            // console.log(bookinginfo);
        }



        // Now check for no of passengers 
        if (bookinginfo["no_of_passengers"] == ""){
            socket.emit("message", "Please enter the number of passengers for the flight.");
        } else {
            socket.emit("input_completed", "All data has been processed");
        }

    })
    socket.on("no_of_pas", (data) => {
        bookinginfo["no_of_passengers"] = parseInt(data);
        // console.log(bookinginfo);
        socket.emit("input_completed", "All data has been processed.");
    })

    socket.on('proceed_with_search', () => {
        if (bookinginfo['oneway'] == true){
            const date = parseDate(bookinginfo["depart_date"])
            const flights = fetchFlights(date);
            socket.emit("single_flight", flights);
        } else {
            const depart_date = parseDate(bookinginfo["arrival_date"])
            const depart_flights = fetchFlights(depart_date);
            const arrival_date = parseDate(bookinginfo["arrival_date"])
            const arrival_flights = fetchFlights(arrival_date);
            socket.emit("dual_flights" ,[depart_flights, arrival_flights]
        }
        
        
        


  

        // Create an asynchronous function to make the API request

    })

    socket.on("sound_on", ()=> {
        console.log("Turn on sound");
    })

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    })
})


const port = 4001;

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
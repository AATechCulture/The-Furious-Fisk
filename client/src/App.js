
import './App.css';
import io from 'socket.io-client';
import React, { useEffect, useState } from "react";


const socket = io.connect("http://localhost:4001");

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);


  useEffect(() => {
    socket.on('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      // socket.disconnect();
    };
  }, [socket]);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (message !== ""){
      console.log(message);
      console.log(message.length);
      if (message.length < 4){
        socket.emit("no_of_pas", message)
      } else{
        socket.emit("message", message);
      }
    }
    setMessages((prevMessages) => [...prevMessages, `You: ${message}`])
    setMessage('');
  };

  return (
    <div className="App">
      <h2>American Airlines Chatbox</h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={handleMessageChange}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;

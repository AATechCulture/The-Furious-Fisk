import './App.css';
import io from 'socket.io-client';
import React, { useEffect, useState } from "react";

const socket = io.connect("http://localhost:4001");
const chatboxImageURL = "data:image/jpeg;base64,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";
function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on('input_completed', ()=> {
      socket.emit("proceed_with_search", "We can search for flights now");
    })

    socket.on('single_flight', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    })

    socket.on('dual-flights', (data)=> {
      setMessages((prevMessages) => [...prevMessages, data]);
    })

    
    return () => {
      // socket.disconnect();
    };
  }, [socket]);




  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (message !== "") {
      if(message.length < 4){
        socket.emit("no_of_pas", message);
      } else {
        socket.emit("message", message);
      }

    }

    setMessages((prevMessages) => [...prevMessages, `You: ${message}`]);
    setMessage('');
  };

  return (
    <div className="App">
       <img src={chatboxImageURL} alt="Chatbox Logo" className="chatbox-image" />
      <h2>Captain Chatbot</h2>
      <div className="chat-box">
      {messages.map((msg, index) => (
  <div key={index} className={msg.startsWith("You:") ? "user-message" : "server-message"}>
    {msg.startsWith("You:") ? (
      <span className="speaker-icon">🔊</span>
    ) : null}
    {msg}
  </div>
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
        {/* <div className="toggle-microphone">
        🎤
        </div> */}
      </form>
    </div>
  );
}

export default App;
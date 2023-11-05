
.App {
  text-align: center;
  background-color: #f0f0f0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative; /* Added position relative to make absolute positioning work */
}

.chatbox-image {
  width: 40px;
  height: auto;
  position: absolute;
  top: 10px;
  left: 10px;
}

h2 {
  background-color: #007bff;
  color: white;
  padding: 10px;
  margin: 0;
  position: relative; /* Added position relative */
}

.chat-box {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #ccc;
  display: flex; /* Added to arrange messages in a column */
  flex-direction: column; /* Added to arrange messages in a column */
}

.user-message {
  background-color: #0078d2;
  color: white;
  padding: 10px;
  padding-right: 40px;
  margin: 10px;
  border-radius: 10px;
  align-self: flex-end;
  max-width: 70%;
  position: relative;
}

.speaker-icon {
  position: absolute;
  top: 50%;
  right: 9px; /* Adjust the right offset as needed */
  transform: translateY(-50%);
  font-size: 20px; /* Adjust the size as needed */
}


.server-message {
  background-color: #f0f0f0;
  color: #333;
  padding: 10px;
  margin: 10px;
  border-radius: 10px;
  align-self: flex-start;
  max-width: 70%;
}

/* Styling for the speaker icon in server messages */
.server-message .speaker-icon {
  position: absolute;
  top: 50%;
  left: -30px; /* Adjust the left offset as needed */
  transform: translateY(-50%);
  font-size: 20px; /* Adjust the size as needed */
}

form {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #ccc;
}

input[type="text"] {
  flex: 1;
  padding: 5px;
  border: 1px solid #ccc;
}

button[type="submit"] {
  background-color: #0078d2;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

/* Add styling for the chatbox logo */
.chatbox-image {
  width: 40px;
  height: auto;
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 1; /* Ensure the image is in front of other elements */
}

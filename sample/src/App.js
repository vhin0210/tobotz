import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [
    waiting,
    setWaiting,
  ] = useState(false);

  const [
    tobotzContent,
    setTobotzContent
  ] = useState('');

  const [
    tobotz,
    connectTobotz
  ] = useState('');

  const [
    message,
    setMessage,
  ] = useState('');


  const [
    chatHistory,
    setChatHistory,
  ] = useState([]);

  useEffect(() => {
    if (!tobotz) {
      startTobotz();
    }
  }, []);

  const startTobotz = async () => {
    const Tobotz = require('Tobotz')
    const options = {
      clientId: 'UDOEAaRNfuX1fTKU1D0jk7bvTC',
      token: 'CInIFRMLr6PhUZRX1CywoCTCGo01h9Nd31trKXcE',
      // userId: 1,
    };
    const tobotz = Tobotz(options)
    const data = await tobotz.connect();
    connectTobotz(tobotz);
  }

  const getTobotzContent = async () => {
    const data = await tobotz.ping();
    setTobotzContent(`${data?.name}: ${data?.message}`);
  }

  const sendMessage = async (message) => {
    const data = await tobotz.send(message);
    if (data?.message.isError !== undefined && data?.message.isError) {
      chatHistory.push(data?.message?.message);
    } else {
      chatHistory.push(`${data.name}: ${data?.message?.message}`);
    }
    setChatHistory(chatHistory);
    setWaiting(false);
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    chatHistory.push(`Me: ${message}`);
    setMessage('');
    setChatHistory(chatHistory);
    setWaiting(true);
    sendMessage(message);
  }

  if (tobotz && !tobotzContent) {
    getTobotzContent();
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Test Chatbot</h1>
        <p>Me: Ping</p>
        <p>{ tobotzContent }</p>
        <form onSubmit={handleSubmit}>
          { chatHistory.map(function(item) {
            return <p>{item}</p>;
          }) }
          { waiting ? <p>Waiting...</p> : null }
          <input type="text" value={message} onChange={(event) => setMessage(event.target.value)} />
          <input type="submit" value="Submit" />
        </form>
      </header>
    </div>
  );
}

export default App;

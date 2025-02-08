// ChatComponent.jsx
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatScreen.css';
import logo from './assets/ChapPhantom Logo No Background.png';

export const ChatScreen = ({ phantom }) => {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState([]); // Array of { role, content }
  const [streamingResponse, setStreamingResponse] = useState('');

  // Log phantom ID when component loads or phantom changes
  useEffect(() => {
    console.log('ChatScreen loaded with phantom ID:', phantom.phantom_id);
  }, [phantom]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    console.log('Sending message for phantom ID:', phantom.phantom_id);

    // Add user message to conversation history
    const newUserMessage = { role: 'user', content: input };
    const updatedConversation = [...conversation, newUserMessage];
    setConversation(updatedConversation);
    setInput('');
    setStreamingResponse('');

    // Initiate a POST to the /chat endpoint
    const response = await fetch('http://127.0.0.1:8000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_input: input,
        messages: updatedConversation,
        source: phantom.phantom_id,
      }),
    });

    // The response is a stream (SSE). We use a reader to process the stream manually.
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    // Read from the stream manually
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Split by SSE event boundaries (\n\n)
      const parts = buffer.split('\n\n');
      buffer = parts.pop(); // Incomplete chunk remains

      parts.forEach((part) => {
        if (part.startsWith('data: ')) {
          const jsonStr = part.replace('data: ', '');
          try {
            const data = JSON.parse(jsonStr);
            if (data.delta !== undefined) {
              setStreamingResponse(data.delta);
            }
            if (data.done) {
              // When done, add the final assistant message to the conversation history
              const newAssistantMessage = {
                role: 'model',
                content: data.final,
              };
              setConversation((prev) => [...prev, newAssistantMessage]);
              // Clear the streaming response to avoid duplicate display
              setStreamingResponse('');
            }
          } catch (err) {
            console.error('Error parsing SSE data', err);
          }
        }
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className='chat-screen'>
      <div className='chat-title'>
        <img src={logo} alt='ChatPhantom Logo' className='chat-logo' />
        <span>
          <strong>{phantom.phantom_name}</strong> Phantom
        </span>
      </div>
      <div className='messages-container'>
        {conversation.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.role === 'user' ? 'user' : 'assistant'}`}
          >
            <div className='message-content'>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {streamingResponse && (
          <div className='message assistant'>
            <div className='message-content'>
              <ReactMarkdown>{streamingResponse}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
      <div className='input-container'>
        <div className='input-box'>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Message ChatPhantom...'
            rows={1}
          />
          <button
            onClick={sendMessage}
            className='send-button'
            disabled={!input.trim()}
          >
            <svg
              stroke='currentColor'
              fill='none'
              strokeWidth='2'
              viewBox='0 0 24 24'
              strokeLinecap='round'
              strokeLinejoin='round'
              height='1em'
              width='1em'
              xmlns='http://www.w3.org/2000/svg'
            >
              <line x1='22' y1='2' x2='11' y2='13'></line>
              <polygon points='22 2 15 22 11 13 2 9 22 2'></polygon>
            </svg>
          </button>
        </div>
        <div className='input-footer'>
          <span className='footer-text'>
            ChatPhantom can make mistakes. Consider checking important
            information.
          </span>
        </div>
      </div>
    </div>
  );
};

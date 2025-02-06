// ChatComponent.jsx
import React, { useState } from 'react';

export const ChatScreen = () => {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState([]); // Array of { role, content }
  const [streamingResponse, setStreamingResponse] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

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

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h1>Pydantic AI Agentic RAG Chat</h1>
      <div style={{ border: '1px solid #ccc', padding: 10, minHeight: 300 }}>
        {conversation.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 10 }}>
            <strong>{msg.role === 'user' ? 'You' : 'Assistant'}:</strong>{' '}
            <span>{msg.content}</span>
          </div>
        ))}
        {/* Display streaming update */}
        {streamingResponse && (
          <div style={{ marginBottom: 10 }}>
            <strong>Assistant:</strong>{' '}
            <span style={{ fontStyle: 'italic' }}>{streamingResponse}</span>
          </div>
        )}
      </div>
      <div style={{ marginTop: 20 }}>
        <input
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Ask your question...'
          style={{ width: '80%', padding: '8px' }}
        />
        <button
          onClick={sendMessage}
          style={{ padding: '8px 12px', marginLeft: 5 }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

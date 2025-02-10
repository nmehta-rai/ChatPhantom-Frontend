// ChatComponent.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatScreen.css';
import logo from './assets/ChapPhantom Logo No Background.png';

export const ChatScreen = ({ phantom }) => {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState([]); // Array of { role, content }
  const [streamingResponse, setStreamingResponse] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [nextHistoryTimestamp, setNextHistoryTimestamp] = useState(null);
  const messagesContainerRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const isNearTopRef = useRef(false);
  const scrollHeightBeforeLoadRef = useRef(0);
  const API_BASE_URL = 'http://127.0.0.1:8000';

  // Reset conversation and history state when phantom changes
  useEffect(() => {
    setConversation([]);
    setStreamingResponse('');
    setInput('');
    setUserHasScrolled(false);
    setHasMoreHistory(true);
    setNextHistoryTimestamp(null);
    loadChatHistory();
  }, [phantom.phantom_id]);

  // Load initial chat history
  const loadChatHistory = async (beforeTimestamp) => {
    if (isLoadingHistory || (!hasMoreHistory && beforeTimestamp)) return;

    setIsLoadingHistory(true);
    try {
      const params = new URLSearchParams();
      if (beforeTimestamp) params.append('before_timestamp', beforeTimestamp);
      params.append('limit', '50');

      const response = await fetch(
        `${API_BASE_URL}/chat/${phantom.phantom_id}/history?${params}`
      );
      const data = await response.json();

      if (beforeTimestamp) {
        // Prepend historical messages
        setConversation((prev) => [...data.messages, ...prev]);
      } else {
        // Initial load
        setConversation(data.messages);
      }

      setHasMoreHistory(data.has_more);
      setNextHistoryTimestamp(data.next_timestamp);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Log phantom ID when component loads or phantom changes
  useEffect(() => {
    console.log('ChatScreen loaded with phantom ID:', phantom.phantom_id);
  }, [phantom]);

  // Add scroll handler with infinite scroll
  useEffect(() => {
    const handleScroll = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      const isNearTop = scrollTop < 200;
      setShowScrollButton(!isNearBottom);

      // Only set userHasScrolled if we're currently streaming and user scrolls up
      if (streamingResponse && !isNearBottom) {
        setUserHasScrolled(true);
      }

      isNearBottomRef.current = isNearBottom;
      isNearTopRef.current = isNearTop;

      // Load more history when near top
      if (isNearTop && hasMoreHistory && !isLoadingHistory) {
        scrollHeightBeforeLoadRef.current = scrollHeight;
        loadChatHistory(nextHistoryTimestamp);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll({ target: container });
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [
    streamingResponse,
    hasMoreHistory,
    isLoadingHistory,
    nextHistoryTimestamp,
  ]);

  // Maintain scroll position when loading more history
  useEffect(() => {
    if (isLoadingHistory) return;

    const container = messagesContainerRef.current;
    if (container && scrollHeightBeforeLoadRef.current > 0) {
      const newScrollHeight = container.scrollHeight;
      const scrollDiff = newScrollHeight - scrollHeightBeforeLoadRef.current;
      container.scrollTop = scrollDiff;
      scrollHeightBeforeLoadRef.current = 0;
    }
  }, [conversation, isLoadingHistory]);

  const scrollToBottom = (force = false) => {
    const container = messagesContainerRef.current;
    if (container && (force || !userHasScrolled)) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom(true); // Force scroll on new message
  }, [conversation]);

  // Auto-scroll while streaming if user hasn't scrolled up
  useEffect(() => {
    if (streamingResponse && !userHasScrolled) {
      scrollToBottom();
    }
  }, [streamingResponse, userHasScrolled]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    console.log('Sending message for phantom ID:', phantom.phantom_id);

    // Reset userHasScrolled when sending a new message
    setUserHasScrolled(false);

    // Add user message to conversation history
    const newUserMessage = { role: 'user', content: input };
    const updatedConversation = [...conversation, newUserMessage];
    setConversation(updatedConversation);
    setInput('');
    setStreamingResponse('');

    // Force scroll to bottom when sending new message
    scrollToBottom(true);

    // Initiate a POST to the /chat endpoint
    const response = await fetch(`${API_BASE_URL}/chat`, {
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
              // Reset userHasScrolled when message is complete
              setUserHasScrolled(false);
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
      <div className='messages-container' ref={messagesContainerRef}>
        {isLoadingHistory && hasMoreHistory && (
          <div className='loading-history'>
            <div className='loading-spinner'></div>
            <span>Loading previous messages...</span>
          </div>
        )}
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
      {showScrollButton && (
        <button
          className='scroll-to-bottom visible'
          onClick={scrollToBottom}
          aria-label='Scroll to bottom'
        >
          <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M7 13l5 5 5-5M7 6l5 5 5-5' />
          </svg>
        </button>
      )}
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

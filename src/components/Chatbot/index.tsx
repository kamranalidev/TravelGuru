import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { getChatbotResponse, getQuickQuestions } from '../../services/chatbotService';
import type { ChatMessage } from '../../services/chatbotService';
import './index.css';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Travel Guroo assistant. How can I help you today?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSendMessage = (message?: string) => {
    const userMessage = message || inputValue.trim();
    if (!userMessage) return;

    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    setTimeout(() => {
      const response = getChatbotResponse(userMessage);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = getQuickQuestions();

  return (
    <>
      {!isOpen && (
        <button
          className="chatbot-toggle-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open chatbot"
        >
          <ChatBubbleIcon sx={{ fontSize: 28 }} />
        </button>
      )}

      {isOpen && (
        <Paper className="chatbot-container" elevation={8}>
          <Box className="chatbot-header">
            <Box className="chatbot-header-content">
              <Typography variant="h6" className="chatbot-title">
                Travel Guroo Assistant
              </Typography>
              <Typography variant="caption" className="chatbot-subtitle">
                Ask me anything about our services
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              className="chatbot-close-button"
              aria-label="Close chatbot"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box className="chatbot-messages">
            {messages.map((message, index) => (
              <Box
                key={index}
                className={`chatbot-message chatbot-message-${message.role}`}
              >
                <Typography variant="body2" className="chatbot-message-content">
                  {message.content}
                </Typography>
              </Box>
            ))}
            {isLoading && (
              <Box className="chatbot-message chatbot-message-assistant">
                <Typography variant="body2" className="chatbot-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {messages.length === 1 && (
            <Box className="chatbot-quick-questions">
              <Typography variant="caption" className="quick-questions-title">
                Quick questions:
              </Typography>
              <Box className="quick-questions-list">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="quick-question-button"
                    onClick={() => handleSendMessage(question)}
                  >
                    {question}
                  </button>
                ))}
              </Box>
            </Box>
          )}

          <Box className="chatbot-input-container">
            <TextField
              inputRef={inputRef}
              fullWidth
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              size="small"
              className="chatbot-input"
              disabled={isLoading}
            />
            <IconButton
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="chatbot-send-button"
              aria-label="Send message"
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};
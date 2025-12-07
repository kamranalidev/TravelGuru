import { useState, useRef, useEffect } from 'react';
import { Box, IconButton, TextField, Paper, Typography, Avatar } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { getChatbotResponse, ChatMessage } from '../../services/chatbotService';
import './index.css';

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! 👋 Welcome to TravelGuru! I\'m here to help you with questions about our Dubai tours and services. How can I assist you today?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await getChatbotResponse(userMessage.content, messages);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or contact our support team at +971586257508.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <IconButton
          className="chatbot-toggle-button"
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 64,
            height: 64,
            backgroundColor: '#FF621F',
            color: 'white',
            boxShadow: '0 4px 20px rgba(255, 98, 31, 0.4)',
            '&:hover': {
              backgroundColor: '#ff8533',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
            zIndex: 1000,
          }}
        >
          <ChatIcon sx={{ fontSize: 32 }} />
        </IconButton>
      )}

      {isOpen && (
        <Paper
          className="chatbot-container"
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: '400px',
            height: '600px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Box
            sx={{
              backgroundColor: '#FF621F',
              color: 'white',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToyIcon />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                TravelGuru Assistant
              </Typography>
            </Box>
            <IconButton
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white', padding: '4px' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 1,
                }}
              >
                {message.role === 'assistant' && (
                  <Avatar
                    sx={{
                      backgroundColor: '#FF621F',
                      width: 32,
                      height: 32,
                    }}
                  >
                    <SmartToyIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                )}
                <Box
                  sx={{
                    maxWidth: '75%',
                    padding: '12px 16px',
                    borderRadius: message.role === 'user' 
                      ? '20px 20px 4px 20px' 
                      : '20px 20px 20px 4px',
                    backgroundColor: message.role === 'user' ? '#FF621F' : 'white',
                    color: message.role === 'user' ? 'white' : '#333',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                    {message.content}
                  </Typography>
                </Box>
                {message.role === 'user' && (
                  <Avatar
                    sx={{
                      backgroundColor: '#e0e0e0',
                      width: 32,
                      height: 32,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 20, color: '#666' }} />
                  </Avatar>
                )}
              </Box>
            ))}
            {isLoading && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  gap: 1,
                }}
              >
                <Avatar
                  sx={{
                    backgroundColor: '#FF621F',
                    width: 32,
                    height: 32,
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box
                  sx={{
                    padding: '12px 16px',
                    borderRadius: '20px 20px 20px 4px',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Typing...
                  </Typography>
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box
            sx={{
              padding: '16px',
              backgroundColor: 'white',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              gap: 1,
            }}
          >
            <TextField
              inputRef={inputRef}
              fullWidth
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '24px',
                },
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              sx={{
                backgroundColor: '#FF621F',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#ff8533',
                },
                '&:disabled': {
                  backgroundColor: '#e0e0e0',
                  color: '#999',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};


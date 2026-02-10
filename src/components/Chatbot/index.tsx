import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, TextField, IconButton, Paper, CircularProgress, } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { getGeminiResponse, getSmartQuickQuestions, } from "../../services/geminiService";
import type { Message } from "../../services/geminiService";
import "./index.css";
export const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hello! 👋 I'm your AI-powered Travel Guroo assistant. I can help you discover amazing Dubai experiences, answer questions about our tours, pricing, and bookings. What would you like to explore today?",
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    const handleSendMessage = async (message?: string) => {
        const userMessage = message || inputValue.trim();
        if (!userMessage || isLoading)
            return;
        const newUserMessage: Message = {
            role: "user",
            content: userMessage,
        };
        setMessages((prev) => [...prev, newUserMessage]);
        setInputValue("");
        setIsLoading(true);
        try {
            
            const response = await getGeminiResponse(messages, userMessage);
            const assistantMessage: Message = {
                role: "assistant",
                content: response,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        }
        catch (error) {
            const errorMessage: Message = {
                role: "assistant",
                content: "I apologize, but I'm having trouble connecting right now. Please try again or contact our support team directly at info@travelguroo.com 📧",
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    const quickQuestions = getSmartQuickQuestions();
    const formatMessage = (content: string) => {
        
        const lines = content.split("\n");
        return lines.map((line, idx) => {
            
            if (line.trim().startsWith("•") ||
                line.trim().startsWith("-") ||
                line.trim().startsWith("*")) {
                return (<div key={idx} className="chatbot-bullet">
            {line}
          </div>);
            }
            
            if (/^\d+[\.\)]\s/.test(line.trim())) {
                return (<div key={idx} className="chatbot-numbered">
            {line}
          </div>);
            }
            
            const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            if (boldFormatted !== line) {
                return (<div key={idx} dangerouslySetInnerHTML={{ __html: boldFormatted }}/>);
            }
            return <div key={idx}>{line || <br />}</div>;
        });
    };
    return (<>
      {!isOpen && (<button className="chatbot-toggle-button" onClick={() => setIsOpen(true)} aria-label="Open AI chatbot">
          <ChatBubbleIcon sx={{ fontSize: 28 }}/>
          <span className="chatbot-ai-badge">
            <AutoAwesomeIcon sx={{ fontSize: 12 }}/>
          </span>
        </button>)}

      {isOpen && (<Paper className="chatbot-container" elevation={8}>
          <Box className="chatbot-header">
            <Box className="chatbot-header-content">
              <Box className="chatbot-title-wrapper">
                <Typography variant="h6" className="chatbot-title">
                  Travel Guroo Assistant
                </Typography>
              </Box>
              <Typography variant="caption" className="chatbot-subtitle">
                Ask me anything about Dubai tours & experiences
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setIsOpen(false)} className="chatbot-close-button" aria-label="Close chatbot">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box className="chatbot-messages">
            {messages.map((message, index) => (<Box key={index} className={`chatbot-message chatbot-message-${message.role}`}>
                {message.role === "assistant" && (<div className="chatbot-avatar">
                    <AutoAwesomeIcon sx={{ fontSize: 16 }}/>
                  </div>)}
                <div className="chatbot-message-bubble">
                  <Typography variant="body2" component="div" className="chatbot-message-content">
                    {formatMessage(message.content)}
                  </Typography>
                </div>
              </Box>))}
            {isLoading && (<Box className="chatbot-message chatbot-message-assistant">
                <div className="chatbot-avatar">
                  <AutoAwesomeIcon sx={{ fontSize: 16 }}/>
                </div>
                <div className="chatbot-message-bubble">
                  <Typography variant="body2" className="chatbot-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </Typography>
                </div>
              </Box>)}
            <div ref={messagesEndRef}/>
          </Box>

          {messages.length === 1 && (<Box className="chatbot-quick-questions">
              <Typography variant="caption" className="quick-questions-title">
                <AutoAwesomeIcon sx={{ fontSize: 14, marginRight: 0.5 }}/>
                Quick questions:
              </Typography>
              <Box className="quick-questions-list">
                {quickQuestions.map((question, index) => (<button key={index} className="quick-question-button" onClick={() => handleSendMessage(question)} disabled={isLoading}>
                    {question}
                  </button>))}
              </Box>
            </Box>)}

          <Box className="chatbot-input-container">
            <TextField inputRef={inputRef} fullWidth placeholder="Ask me about tours, pricing, bookings..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} variant="outlined" size="small" className="chatbot-input" disabled={isLoading}/>
            <IconButton onClick={() => handleSendMessage()} disabled={!inputValue.trim() || isLoading} className="chatbot-send-button" aria-label="Send message">
              {isLoading ? (<CircularProgress size={20} sx={{ color: "#FF621F" }}/>) : (<SendIcon />)}
            </IconButton>
          </Box>

          <Box className="chatbot-footer">
            <Typography variant="caption" className="chatbot-footer-text">
              Powered by AI • Real-time data from our services
            </Typography>
          </Box>
        </Paper>)}
    </>);
};

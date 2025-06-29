import React, { useState, useCallback, useMemo, useContext } from 'react';
import { generateId, toBase64 } from '../utils/helper';
import { useSettings } from './settings';
import { useOllamaAPI } from '../services/ollamaService';
const ChatContext = React.createContext(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { settings } = useSettings();

  const createConversation = useCallback((model) => {
    const newConv = {
      id: generateId(),
      title: 'New Conversation',
      messages: [],
      model,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversation(newConv);
  }, []);

  const selectConversation = useCallback((id) => {
    const found = conversations.find(c => c.id === id);
    if (found) setCurrentConversation(found);
  }, [conversations]);

  const deleteConversation = useCallback((id) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversation?.id === id) {
      setCurrentConversation(null);
    }
  }, [currentConversation]);
  const { processImage, streamChat } = useOllamaAPI(settings.ollamaUrl);
  const sendMessage = useCallback(async (content, images = []) => {
    if (!currentConversation) return;



    const userMsg = {
      id: generateId(),
      role: 'user',
      content,
      images,
      timestamp: new Date()
    };

    const assistantMsg = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    const updatedConv = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMsg, assistantMsg],
      title: currentConversation.messages.length === 0 ? content.slice(0, 50) + '...' : currentConversation.title,
      updatedAt: new Date()
    };

    setCurrentConversation(updatedConv);
    setConversations(prev => prev.map(c => c.id === updatedConv.id ? updatedConv : c));
    setIsLoading(true);
    setError(null);

    try {
      let response = '';
      if (images.length > 0) {
        let response = '';

        await processImage(images[0], content, currentConversation.model, (partial) => {
          response = partial;
          const streamMsg = { ...assistantMsg, content: response, isStreaming: true };
          const streamConv = {
            ...updatedConv,
            messages: [...updatedConv.messages.slice(0, -1), streamMsg]
          };
          setCurrentConversation(streamConv);
          setConversations(prev => prev.map(c => c.id === streamConv.id ? streamConv : c));
        });

        const finalMsg = { ...assistantMsg, content: response, isStreaming: false };
        const finalConv = {
          ...updatedConv,
          messages: [...updatedConv.messages.slice(0, -1), finalMsg]
        };
        setCurrentConversation(finalConv);
        setConversations(prev => prev.map(c => c.id === finalConv.id ? finalConv : c));
      }

      else {
        for await (const chunk of streamChat([...currentConversation.messages, userMsg], currentConversation.model)) {
          response += chunk;
          const streamMsg = { ...assistantMsg, content: response, isStreaming: true };
          const streamConv = { ...updatedConv, messages: [...updatedConv.messages.slice(0, -1), streamMsg] };
          setCurrentConversation(streamConv);
          setConversations(prev => prev.map(c => c.id === streamConv.id ? streamConv : c));
        }

        const finalMsg = { ...assistantMsg, content: response, isStreaming: false };
        const finalConv = { ...updatedConv, messages: [...updatedConv.messages.slice(0, -1), finalMsg] };
        setCurrentConversation(finalConv);
        setConversations(prev => prev.map(c => c.id === finalConv.id ? finalConv : c));
      }
    } catch (err) {
      const errorMsg = {
        ...assistantMsg,
        content: '',
        error: err.message || 'Unexpected error',
        isStreaming: false
      };
      const errorConv = {
        ...updatedConv,
        messages: [...updatedConv.messages.slice(0, -1), errorMsg]
      };
      setCurrentConversation(errorConv);
      setConversations(prev => prev.map(c => c.id === errorConv.id ? errorConv : c));
      setError(err.message || 'Failed to get response from Ollama');
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, settings]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(() => ({
    conversations,
    currentConversation,
    isLoading,
    error,
    setCurrentConversation,
    createConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
    clearError
  }), [
    conversations, currentConversation, isLoading,
    error, createConversation, selectConversation,
    deleteConversation, sendMessage, clearError,
    setCurrentConversation
  ]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

import React, { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import MessageItem from './messageItem';
import { useChat } from '../contexts/chat';

const MessageList = () => {
  const { currentConversation } = useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log(currentConversation?.messages,"currentConversation")
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-500 mb-2">Start a conversation</h3>
          <p className="text-gray-400">Send a message to begin chatting with the AI assistant.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {currentConversation.messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
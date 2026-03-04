import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import MessageItem from './messageItem';
import { useChat } from '../contexts/chat';

const MessageList = () => {
  const { currentConversation } = useChat();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const contentRef = useRef(null); // Ref for the inner content wrapper
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Handle scroll events to detect if user is at bottom
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // Check if we are close to the bottom (within 100px)
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isBottom = distanceFromBottom < 100;

    // Only update state if it changed to prevent extra renders
    if (isBottom !== isAtBottom) {
      setIsAtBottom(isBottom);
    }
  };

  const scrollToBottom = (behavior = 'auto') => {
    // We use the container directly for more control than scrollIntoView
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: behavior
      });
    }
  };

  // Scroll on new messages (array length change)
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom('smooth');
    }
  }, [currentConversation?.messages?.length, isAtBottom]); // Added isAtBottom to dependencies to ensure it re-runs if state changes

  // Use ResizeObserver to detect height changes (streaming/tables)
  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const resizeObserver = new ResizeObserver(() => {
      if (isAtBottom) {
        scrollToBottom('auto');
      }
    });

    resizeObserver.observe(contentElement);

    return () => {
      if (contentElement) {
        resizeObserver.unobserve(contentElement);
      }
    };
  }, [isAtBottom]); // Re-bind if lock state changes, though mostly we just need the observer running

  // Initial load
  useEffect(() => {
    setIsAtBottom(true);
    setTimeout(() => scrollToBottom('auto'), 100);
  }, [currentConversation?.id]);

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors h-full w-full">
        <div className="text-center p-8">
          <MessageSquare className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">Start a conversation</h3>
          <p className="text-gray-400 dark:text-gray-600">Send a message to begin chatting with the AI assistant.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors custom-scrollbar w-full relative"
      ref={containerRef}
      onScroll={handleScroll}
    >
      <div
        ref={contentRef}
        className="flex flex-col min-h-full pb-4"
      >
        {currentConversation.messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {/* Helper div for scroll bottom, though container.scrollTop is cleaner now */}
        <div ref={messagesEndRef} className="h-4 flex-shrink-0" />
      </div>
    </div>
  );
};

export default MessageList;
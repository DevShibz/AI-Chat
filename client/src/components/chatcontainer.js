import React from 'react';
import Sidebar from './sidebar';
import ModelSelector from './modelselector';
import MessageList from './messagelist';
import InputArea from './inputArea';


const ChatContainer = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <ModelSelector />
        <MessageList />
        <InputArea />
      </div>
    </div>
  );
};

export default ChatContainer;

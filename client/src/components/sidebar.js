import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useChat } from '../contexts/chat';

const Sidebar = () => {
  const {
    conversations,
    currentConversation,
    selectConversation,
    createConversation,
    deleteConversation,
  } = useChat();

  return (
    <div className="w-64 border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-lg">Conversations</h2>
        <button onClick={createConversation} title="New Conversation">
          <Plus className="w-5 h-5 text-blue-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
              currentConversation?.id === conv.id ? 'bg-gray-100 font-semibold' : ''
            }`}
            onClick={() => selectConversation(conv.id)}
          >
            <span className="truncate">{conv.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteConversation(conv.id);
              }}
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useState } from 'react';
import { Plus, Trash2, MessageSquare, PanelLeftClose, PanelLeftOpen, Sun, Moon, Settings } from 'lucide-react';
import { useChat } from '../contexts/chat';
import { usePreferences } from '../contexts/preferences';

import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const {
    conversations,
    currentConversation,
    selectConversation,
    createConversation,
    deleteConversation,
  } = useChat();

  const { preferences, toggleTheme } = usePreferences();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNewChat = () => {
    createConversation();
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleSelectConv = (id) => {
    selectConversation(id);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center border-r transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-72'
        } bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800`}
    >
      {/* Header / Toggle */}
      <div className={`w-full flex items-center p-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100 cursor-pointer" onClick={() => navigate('/')}>Chat</h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="w-full px-3 mb-4">
        <button
          onClick={handleNewChat}
          className={`flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors ${isCollapsed ? 'px-0' : 'px-4'
            }`}
          title="New Conversation"
        >
          <Plus className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium text-sm">New Chat</span>}
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 w-full overflow-y-auto px-3 space-y-1 custom-scrollbar">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => handleSelectConv(conv.id)}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${currentConversation?.id === conv.id && location.pathname === '/'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-gray-700'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            title={conv.title}
          >
            <MessageSquare className={`flex-shrink-0 w-4 h-4 ${currentConversation?.id === conv.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />

            {!isCollapsed && (
              <>
                <span className="flex-1 truncate text-sm font-medium">
                  {conv.title || 'New Conversation'}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded transition-all"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Footer / User Profile & Settings */}
      {!isCollapsed ? (
        <div className="w-full p-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
          <div className="flex items-center justify-between gap-2 mb-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors"
              title="Toggle Theme"
            >
              {preferences.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => navigate('/settings')}
              className={`p-2 rounded-lg transition-colors ${location.pathname === '/settings'
                  ? 'bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800'
                }`}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              AI
            </div>
            <div className="flex-col">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">User</p>
              <p className="text-xs text-gray-500">Free Plan</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full p-4 border-t border-gray-200 dark:border-gray-800 mt-auto flex flex-col items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors"
            title="Toggle Theme"
          >
            {preferences.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => navigate('/settings')}
            className={`p-2 rounded-lg transition-colors ${location.pathname === '/settings'
                ? 'bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800'
              }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

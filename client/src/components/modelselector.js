import React from 'react';
import { Settings } from 'lucide-react';
import { useChat } from '../contexts/chat';

const models = ['gpt-4', 'gpt-3.5-turbo'];

const ModelSelector = () => {
  const { selectedModel, setSelectedModel } = useChat();

  return (
    <div className="p-3 border-b border-gray-200 flex items-center justify-between">
      <span className="text-sm text-gray-600 flex items-center gap-1">
        <Settings className="w-4 h-4" /> Model
      </span>
      <select
        className="text-sm border border-gray-300 rounded px-2 py-1"
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
      >
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ModelSelector;
import React, { useEffect, useState, useRef } from 'react';
import { Settings, Loader2, ChevronDown, Cpu } from 'lucide-react';
import { useChat } from '../contexts/chat';
import { useOllamaAPI } from '../services/ollamaService';
import { useSettings } from '../contexts/settings';

const ModelSelector = () => {
  const { selectedModel, setSelectedModel, updateConversationModel } = useChat();
  const { settings } = useSettings();
  const { getModels } = useOllamaAPI(settings.ollamaUrl);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const fetchedModels = await getModels();
        setModels(fetchedModels);
      } catch (error) {
        console.error("Failed to load models", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [getModels]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (modelName) => {
    setSelectedModel(modelName);
    updateConversationModel(modelName);
    setIsOpen(false);
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400' : 'bg-green-500'}`} />
        <span className="max-w-[150px] truncate">{selectedModel || 'Select Model'}</span>
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
        ) : (
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 py-1 max-h-80 overflow-y-auto custom-scrollbar">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-50 dark:border-gray-700 mb-1">
            Available Models
          </div>
          {models.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">No models found</div>
          ) : (
            models.map((model) => {
              const modelName = model.name || model;
              const isSelected = selectedModel === modelName;
              return (
                <button
                  key={modelName}
                  onClick={() => handleSelect(modelName)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                >
                  <Cpu className={`w-4 h-4 ${isSelected ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400'}`} />
                  <div className="flex-1 truncate">
                    <div className="font-medium">{modelName}</div>
                    {model.details && (
                      <div className="text-xs text-gray-400">{model.details.parameter_size || ''} {model.details.quantization_level || ''}</div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
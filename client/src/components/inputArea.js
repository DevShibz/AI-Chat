import React, { useState, useRef } from 'react';
import { Image, Send, Loader2, X, Paperclip } from 'lucide-react';
import { useChat } from '../contexts/chat';

const InputArea = () => {
  const [input, setInput] = useState('');
  const [images, setImages] = useState([]);
  const { sendMessage, isLoading, currentConversation } = useChat();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const content = input.trim();
    // Ensure we only pass clean image data (base64 strings)
    const messageImages = images.map(img => {
      // If img is already a string, return it; otherwise extract the base64 data
      if (typeof img === 'string') {
        return img;
      }
      // Handle case where img might be an object with a data property
      return img.data || img.src || img;
    }).filter(img => typeof img === 'string' && img.startsWith('data:'));

    setInput('');
    setImages([]);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(content, messageImages);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        console.warn('Skipped non-image file:', file.name);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (result && typeof result === 'string') {
          setImages(prev => [...prev, result]);
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };

      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = (e) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 200) + 'px';
    setInput(target.value);
  };

  const disabled = !currentConversation || isLoading;

  return (
    <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-3xl mx-auto">
        {images.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto py-2 px-1">
            {images.map((image, index) => (
              <div key={index} className="relative group flex-shrink-0">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`relative flex items-end gap-2 p-2 rounded-2xl border transition-all duration-200 ${disabled
              ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 shadow-sm focus-within:shadow-md focus-within:border-blue-400 dark:focus-within:border-blue-500'
            }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2.5 mb-0.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors disabled:opacity-50"
            title="Attach image"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={adjustTextareaHeight}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Select a conversation to start..." : "Message AI..."}
            disabled={disabled}
            rows={1}
            className="flex-1 max-h-[200px] py-3 px-2 bg-transparent border-none resize-none focus:ring-0 focus:outline-none custom-scrollbar text-gray-700 dark:text-gray-200 placeholder-gray-400 text-base"
            style={{ minHeight: '44px' }}
          />

          <button
            type="submit"
            disabled={disabled || (!input.trim() && images.length === 0)}
            className={`p-2.5 mb-0.5 rounded-xl transition-all duration-200 ${input.trim() || images.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5 ml-0.5" />
            )}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
          AI can make mistakes. Please double-check responses.
        </p>
      </div>
    </div>
  );
};

export default InputArea;
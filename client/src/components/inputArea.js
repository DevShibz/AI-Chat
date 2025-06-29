import React, { useState, useRef } from 'react';
import { Image, Send, Loader2, X } from 'lucide-react';
import { useChat } from '../contexts/chat';

const InputArea = () => {
  const [input, setInput] = useState('');
  const [images, setImages] = useState([]);
  const { sendMessage, isLoading, currentConversation } = useChat();
  const fileInputRef = useRef(null);

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
    await sendMessage(content, messageImages);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.warn('Skipped non-image file:', file.name);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (result && typeof result === 'string') {
          // Store only the base64 string, no DOM references
          setImages(prev => [...prev, result]);
        }
      };
      
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
      
      reader.readAsDataURL(file);
    });
    
    // Clear the file input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const disabled = !currentConversation || isLoading;

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {images.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  console.error('Error loading image preview:', e);
                  // Remove the problematic image
                  removeImage(index);
                }}
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
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
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Image className="h-5 w-5" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={disabled ? "Select a conversation to start chatting..." : "Type your message..."}
          disabled={disabled}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />

        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
};

export default InputArea;
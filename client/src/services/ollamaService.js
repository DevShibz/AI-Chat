import { useCallback, useRef } from 'react';
import { extractBase64, removeCircularReferences, safeLog, safeStringify } from '../utils/helper';

export const useOllamaAPI = (baseUrl = 'http://localhost:4000') => {
  const controllerRef = useRef(null);

  const getModels = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/api/models`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Failed to fetch models:', error);
      throw new Error('Failed to connect to Ollama. Please ensure the server is running.');
    }
  }, [baseUrl]);

  const streamChat = useCallback(async function* (messages, model) {
    console.log('streamChat', messages, model);
    try {
      // Clean up messages to ensure no circular references
      const cleanMessages = messages.map(msg => {
        const cleanMsg = {
          role: msg.role,
          content: msg.content
        };

        // Handle images safely
        if (msg.images && Array.isArray(msg.images) && msg.images.length > 0) {
          const cleanImages = msg.images
            .map(extractBase64)
            .filter(Boolean); // Remove null/undefined values

          if (cleanImages.length > 0) {
            cleanMsg.images = cleanImages;
          }
        }

        return cleanMsg;
      });

      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          messages: cleanMessages,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body reader available');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Log first chunk arrival for debugging
        if (!buffer) console.log('Received first stream chunk');

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.message?.content) {
                yield data.message.content;
              }
              if (data.done) return;
            } catch (e) {
              console.warn('Skipping invalid JSON chunk:', line, e);
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer);
          if (data.message?.content) yield data.message.content;
        } catch (e) {
          console.warn('Skipping invalid final JSON chunk:', buffer, e);
        }
      }
    } catch (error) {
      console.error('Stream chat error:', error);
      throw new Error('Failed to stream chat response. Please check your connection.');
    }
  }, [baseUrl]);

  // const processImage = useCallback(async (image, prompt, model) => {
  //   try {
  //     // Safely extract base64 data from image

  //     const cleanImage = await removeCircularReferences(image);
  //     const response = await fetch(`${baseUrl}/api/images`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ 
  //         model: 'gemma3:4b', 
  //         prompt: prompt, 
  //         image: cleanImage 
  //       })
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
  //       throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     return data.message?.content || 'No response from image processing';
  //   } catch (error) {
  //     console.error('Image processing error:', error);
  //     throw new Error("Failed to process image. Please ensure you're using a vision-capable model like llava.");
  //   }
  // }, [baseUrl]);

  const processImage = useCallback(async (image, prompt, model, onStream) => {
    const response = await fetch(`${baseUrl}/api/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // model: 'gemma3:4b',
        model: model,
        prompt,
        image,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Failed to process image: ${response.status}`);
    }

    const decoder = new TextDecoder();
    const reader = response.body.getReader();

    let responseText = '';
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Split on newlines (assuming each chunk ends with `\n`)
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Save last partial line for next chunk

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.message && parsed.message.role === 'assistant' && parsed.message.content) {
            responseText += parsed.message.content;
            if (onStream) onStream(responseText);
          }
        } catch (err) {
          console.warn('Failed to parse stream chunk:', err, line);
        }
      }
    }

    return responseText;
  }, [baseUrl]);

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/api/status`);
      const data = await response.json();
      return data.status === 'connected';
    } catch (error) {
      console.error('Status check error:', error);
      return false;
    }
  }, [baseUrl]);

  return {
    getModels,
    streamChat,
    processImage,
    checkStatus,
  };
};
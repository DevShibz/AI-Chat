// Generate a random ID (similar to nanoid, but lightweight)
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Format a Date object to hh:mm AM/PM format
export const formatTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Export a conversation object as a downloadable JSON file
export const exportConversation = (conversation) => {
  const data = JSON.stringify(conversation, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `conversation-${conversation.title}.json`;
  a.click();
  URL.revokeObjectURL(url);
};


export const toBase64 = (file) => {
  console.log(file, "file in toBase64")
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // base64 string
    reader.onerror = reject;
    reader.readAsDataURL(file); // this is the key line
  });
};

export const  svgToBase64 =(svgElement) =>{
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const base64 = btoa(unescape(encodeURIComponent(svgString)));
  return `data:image/svg+xml;base64,${base64}`;
}

export const  safeLog = (message, data) => {
  try {
    if (typeof data === 'string') {
      // For base64 strings, just log the beginning to avoid console spam
      if (data.startsWith('data:image/')) {
        const preview = data.substring(0, 50) + '...[base64 data]';
        console.log(message, preview);
      } else {
        console.log(message, data);
      }
    } else if (data && typeof data === 'object') {
      // Create a safe representation of the object
      const safeData = {
        type: typeof data,
        constructor: data.constructor?.name || 'Unknown',
        keys: Object.keys(data).slice(0, 5), // Only show first 5 keys
        hasCircularRef: false
      };
      
      try {
        JSON.stringify(data);
      } catch (e) {
        if (e.message.includes('circular')) {
          safeData.hasCircularRef = true;
        }
      }
      
      console.log(message, safeData);
    } else {
      console.log(message, data);
    }
  } catch (error) {
    console.log(message, '[Unable to log data safely]', error.message);
  }
};

// Alternative function to clean image data before processing
export const cleanImageData = (images) => {
  if (!Array.isArray(images)) {
    return [];
  }
  
  return images
    .filter(img => img && typeof img === 'string')
    .filter(img => img.startsWith('data:image/'))
    .map(img => {
      // Extract just the base64 part if needed
      const base64Match = img.match(/^data:image\/[^;]+;base64,(.+)$/);
      return base64Match ? base64Match[1] : img;
    });
};

export const extractBase64 = (imageData) => {
  if (typeof imageData === 'string') {
    if (imageData.startsWith('data:image/')) {
      return imageData;
    }
    // If it's just the base64 part, add the data URL prefix
    return `data:image/jpeg;base64,${imageData}`;
  }
  
  // If it's an object, try to extract meaningful data
  if (imageData && typeof imageData === 'object') {
    if (imageData.src && typeof imageData.src === 'string') {
      return imageData.src;
    }
    if (imageData.data && typeof imageData.data === 'string') {
      return imageData.data;
    }
  }
  
  return null;
};


export const removeCircularReferences = async(obj) => {
  const seen = new WeakSet();
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return;
      seen.add(value);
    }
    return value;
  }));
};
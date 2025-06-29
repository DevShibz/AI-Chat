const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors(
    {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }
));
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// Utility function to convert base64 to buffer
const base64ToBuffer = (base64String) => {
    // Remove data:image/jpeg;base64, prefix if present
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
};

// Utility function to detect if a model supports vision
const isVisionModel = (modelName) => {
    const visionModels = ['llava', 'bakllava', 'llava-phi3', 'moondream'];
    return visionModels.some(vm => modelName.toLowerCase().includes(vm));
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Enhanced chat endpoint with image support
app.post('/api/chat', async (req, res) => {
    try {
        const { model, messages, stream, options } = req.body;

        // Validate required fields
        if (!model || !messages || !Array.isArray(messages)) {
            return res.status(400).json({
                error: 'Invalid request. Model and messages array are required.'
            });
        }

        // Process messages to handle images
        const processedMessages = messages.map(msg => {
            const processedMsg = {
                role: msg.role,
                content: msg.content
            };

            // If message has images and model supports vision
            if (msg.images && msg.images.length > 0) {
                processedMsg.images = msg.images.map(img => {
                    // If it's a base64 string, convert it to the format Ollama expects
                    if (typeof img === 'string' && img.startsWith('data:image')) {
                        return img.split(',')[1]; // Remove data:image/jpeg;base64, prefix
                    }
                    return img;
                });
            }

            return processedMsg;
        });

        const requestBody = {
            model,
            messages: processedMessages,
            stream: stream !== false, // Default to true
            ...(options && { options })
        };

        console.log(`Making request to Ollama: ${model} (${processedMessages.length} messages)`);

        const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Ollama API error: ${response.status} - ${errorText}`);
            throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
        }

        response.body.pipe(res);

    } catch (error) {
        console.error('Chat API Error:', error.message);

        if (!res.headersSent) {
            res.status(500).json({
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
});

// Dedicated image processing endpoint (alternative approach)
app.post('/api/images', async (req, res) => {
  try {
    const { model, prompt, image, options } = req.body;

    let imageData = image;
    if (typeof image === 'string' && image.startsWith('data:image')) {
      imageData = image.split(',')[1];
    }

    const requestBody = {
      model,
      messages: [{
        role: 'user',
        content: prompt,
        images: [imageData]
      }],
      stream: true,
      ...(options && { options })
    };

    const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!ollamaRes.ok || !ollamaRes.body) {
      const text = await ollamaRes.text();
      throw new Error(`Ollama API error: ${ollamaRes.status} - ${text}`);
    }

    // Set headers to allow chunked streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    // ✅ Pipe response stream directly from Ollama to client
    ollamaRes.body.pipe(res);

    // Close stream on finish
    ollamaRes.body.on('end', () => res.end());

  } catch (error) {
    console.error('Image processing error:', error.message);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// File upload endpoint for images
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Convert buffer to base64
        const base64Image = req.file.buffer.toString('base64');
        const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

        res.json({
            success: true,
            image: dataUrl,
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

    } catch (error) {
        console.error('Upload error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Get available models with enhanced information
app.get('/api/models', async (req, res) => {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);

        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.status}`);
        }

        const data = await response.json();

        // Enhanced model information
        const enhancedModels = data.models?.map(model => ({
            name: model.name,
            size: model.size,
            modified: model.modified_at,
            digest: model.digest,
            details: model.details,
            supportsVision: isVisionModel(model.name),
            family: model.details?.family || 'unknown'
        })) || [];

        res.json({
            models: enhancedModels,
            total: enhancedModels.length,
            visionModels: enhancedModels.filter(m => m.supportsVision).length
        });

    } catch (error) {
        console.error('Error fetching models:', error.message);
        res.status(500).json({
            error: 'Failed to fetch models',
            details: error.message
        });
    }
});

// Get model information
app.get('/api/models/:name', async (req, res) => {
    try {
        const { name } = req.params;

        const response = await fetch(`${OLLAMA_BASE_URL}/api/show`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name })
        });

        if (!response.ok) {
            throw new Error(`Model not found: ${name}`);
        }

        const modelInfo = await response.json();

        res.json({
            ...modelInfo,
            supportsVision: isVisionModel(name)
        });

    } catch (error) {
        console.error('Error fetching model info:', error.message);
        res.status(404).json({
            error: `Model '${req.params.name}' not found`,
            details: error.message
        });
    }
});

// Check Ollama server status
app.get('/api/status', async (req, res) => {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/version`);

        if (response.ok) {
            const version = await response.json();
            res.json({
                status: 'connected',
                ollama: version,
                url: OLLAMA_BASE_URL
            });
        } else {
            throw new Error('Ollama server not responding');
        }
    } catch (error) {
        res.status(503).json({
            status: 'disconnected',
            error: error.message,
            url: OLLAMA_BASE_URL
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);

    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
    }

    res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Ollama Proxy Server running on http://localhost:${PORT}`);
    console.log(`📡 Proxying to Ollama at: ${OLLAMA_BASE_URL}`);
    console.log(`🖼️  Image upload endpoint: http://localhost:${PORT}/api/upload`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🤖 Available models: http://localhost:${PORT}/api/models`);
});

module.exports = app;
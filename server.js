// server.js - Simple WhatsApp Bot API (No Baileys)
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve Frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// WhatsApp Simulation API
app.post('/api/simulate-message', (req, res) => {
    const { message, sender } = req.body;
    
    const responses = {
        'hi': 'Hello from Railway Bot! 🚂',
        'hello': 'Hi there! How can I help?',
        'কেমন আছো': 'আলহামদুলিল্লাহ, ভালো আছি! আপনি কেমন আছেন?',
        'ধন্যবাদ': 'আপনাকেও অসংখ্য ধন্যবাদ! 😊',
        'help': 'আমি নিম্নলিখিত বিষয়ে সাহায্য করতে পারি:\n• তথ্য জানা\n• চ্যাট করা\n• সহযোগিতা করা',
        'নাম': 'আমার নাম AI Assistant, আপনি আমাকে যা ডাকবেন তাই!',
        'সময়': `এখন সময়: ${new Date().toLocaleTimeString('bn-BD')}`,
        'তারিখ': `আজ: ${new Date().toLocaleDateString('bn-BD')}`,
    };
    
    const lowerMsg = message.toLowerCase();
    let reply = `আপনি লিখেছেন: "${message}"\nআমি এখনো শিখছি, সামনে আরও ভালো সাহায্য করতে পারব!`;
    
    for (const [key, value] of Object.entries(responses)) {
        if (lowerMsg.includes(key.toLowerCase())) {
            reply = value;
            break;
        }
    }
    
    res.json({
        success: true,
        original: message,
        reply: reply,
        sender: sender || 'anonymous',
        timestamp: new Date().toISOString(),
        server: 'Railway WhatsApp Bot'
    });
});

// Get Bot Status
app.get('/api/status', (req, res) => {
    res.json({
        status: 'active',
        service: 'whatsapp-ai-bot',
        version: '1.0.0',
        uptime: process.uptime(),
        time: new Date().toISOString(),
        features: ['AI Responses', 'Bengali Support', 'API Access']
    });
});

// Start WhatsApp Session (Simulation)
app.get('/api/start-session', (req, res) => {
    const sessionId = 'session_' + Date.now();
    
    res.json({
        success: true,
        sessionId: sessionId,
        message: 'WhatsApp session started (Simulation)',
        qr: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyNUQzNjYiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RGVtbyBRUjwvdGV4dD48L3N2Zz4=`,
        instructions: 'This is a simulation. For real WhatsApp, install Baileys locally.'
    });
});

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ WhatsApp AI Bot Server Started!`);
    console.log(`🌐 Port: ${PORT}`);
    console.log(`🚀 API: http://localhost:${PORT}/api/status`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 Health: http://localhost:${PORT}/health`);
});

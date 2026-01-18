// server.js - Railway Compatible Version
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve Frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'running', 
        message: 'WhatsApp Bot Server is working!',
        time: new Date().toISOString()
    });
});

app.post('/api/start-bot', (req, res) => {
    res.json({
        success: true,
        message: 'Bot start requested',
        qr: 'demo-qr-data'
    });
});

app.post('/api/stop-bot', (req, res) => {
    res.json({ success: true, message: 'Bot stopped' });
});

// Simple WhatsApp Bot Simulation
app.post('/api/message', (req, res) => {
    const { message, sender } = req.body;
    
    const responses = {
        'hi': 'Hello! How can I help you?',
        'hello': 'Hi there!',
        'কেমন আছো': 'আমি ভালো আছি, আপনাকে ধন্যবাদ!',
        'ধন্যবাদ': 'আপনাকেও ধন্যবাদ!',
        'help': 'আমি আপনাকে সাহায্য করতে পারি।'
    };
    
    const lowerMsg = message.toLowerCase();
    let reply = 'আমি এখনো শিখছি। আপনি অন্য কিছু জিজ্ঞাসা করুন!';
    
    for (const [key, value] of Object.entries(responses)) {
        if (lowerMsg.includes(key)) {
            reply = value;
            break;
        }
    }
    
    res.json({
        success: true,
        originalMessage: message,
        reply: reply,
        timestamp: new Date().toISOString()
    });
});

// Health Check (Railway requires this)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'whatsapp-bot' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`📡 API Status: http://localhost:${PORT}/api/status`);
});

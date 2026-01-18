// server_mobile.js - মোবাইলেও চালানো যায়
const express = require('express');
const qrcode = require('qrcode-terminal');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>WhatsApp Bot</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    background: #f0f0f0;
                }
                .container {
                    max-width: 500px;
                    margin: 0 auto;
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                .qr-box {
                    text-align: center;
                    margin: 20px 0;
                }
                .status {
                    padding: 10px;
                    border-radius: 5px;
                    margin: 10px 0;
                }
                .online { background: #d4edda; color: #155724; }
                .offline { background: #f8d7da; color: #721c24; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📱 WhatsApp AI Bot</h1>
                <div class="status offline" id="status">বট বন্ধ আছে</div>
                
                <div class="qr-box">
                    <h3>QR Code:</h3>
                    <div id="qrcode"></div>
                    <p id="qrText">Start বাটনে ক্লিক করুন</p>
                </div>
                
                <button onclick="startBot()" style="padding: 10px 20px; background: #25D366; color: white; border: none; border-radius: 5px; font-size: 16px;">
                    ▶️ Start Bot
                </button>
                
                <script>
                    function startBot() {
                        fetch('/start-bot')
                            .then(res => res.text())
                            .then(data => {
                                document.getElementById('status').innerHTML = 'বট চালু হয়েছে';
                                document.getElementById('status').className = 'status online';
                            });
                    }
                </script>
            </div>
        </body>
        </html>
    `);
});

let sock = null;

app.get('/start-bot', async (req, res) => {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./auth');
        
        sock = makeWASocket({
            auth: state,
            printQRInTerminal: true
        });

        sock.ev.on('connection.update', ({ qr, connection }) => {
            if (qr) {
                console.log('QR Received');
                qrcode.generate(qr, { small: true });
            }
            
            if (connection === 'open') {
                console.log('✅ WhatsApp Connected!');
            }
        });

        sock.ev.on('creds.update', saveCreds);

        // মেসেজ হ্যান্ডেল
        sock.ev.on('messages.upsert', ({ messages }) => {
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe) return;
            
            const userMsg = msg.message.conversation;
            const sender = msg.key.remoteJid;
            
            if (userMsg) {
                const response = getAIResponse(userMsg);
                sock.sendMessage(sender, { text: response });
                console.log(`Message to ${sender}: ${response}`);
            }
        });

        res.send('Bot started! Check terminal for QR code.');
    } catch (error) {
        res.send('Error: ' + error.message);
    }
});

function getAIResponse(message) {
    const responses = {
        'hi': 'Hello from Mobile Bot!',
        'hello': 'Hi there!',
        'কেমন আছো': 'ভালো আছি, ধন্যবাদ!',
        'ধন্যবাদ': 'আপনাকেও ধন্যবাদ!'
    };
    
    const lowerMsg = message.toLowerCase();
    for (const [key, value] of Object.entries(responses)) {
        if (lowerMsg.includes(key)) return value;
    }
    
    return 'আপনার মেসেজ: ' + message;
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open browser: http://localhost:${PORT}`);
});
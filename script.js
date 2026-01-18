// DOM এলিমেন্ট
const qrCodeElement = document.getElementById('qrCode');
const qrMessageElement = document.getElementById('qrMessage');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const startBotBtn = document.getElementById('startBot');
const stopBotBtn = document.getElementById('stopBot');
const generateQRBtn = document.getElementById('generateQR');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessage');
const logContainer = document.getElementById('logContainer');
const clearLogsBtn = document.getElementById('clearLogs');
const messageCountElement = document.getElementById('messageCount');
const userCountElement = document.getElementById('userCount');

// Railway API-তে কানেক্ট করার ফাংশন
async function connectToRailwayAPI() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        console.log('Railway API Connected:', data);
        addLog(`Server Status: ${data.status}`, 'success');
        
        return true;
    } catch (error) {
        console.error('API Connection failed:', error);
        addLog('Railway API Connection Failed', 'error');
        return false;
    }
}

// WhatsApp Session Start (Simulation)
async function startWhatsAppSession() {
    try {
        const response = await fetch('/api/start-session');
        const data = await response.json();
        
        if (data.success) {
            // Show QR Code
            document.getElementById('qrCode').innerHTML = 
                `<img src="${data.qr}" alt="QR Code" style="width:200px;height:200px;">`;
            
            addLog('WhatsApp Session Started (Simulation)', 'success');
            updateBotStatus(true);
        }
    } catch (error) {
        console.error('Session start failed:', error);
    }
}

// Send Message to Railway API
async function sendToAPI(message) {
    try {
        const response = await fetch('/api/simulate-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: message,
                sender: 'web-user'
            })
        });
        
        const data = await response.json();
        return data.reply;
    } catch (error) {
        return 'API Error: ' + error.message;
    }
}

// Update your existing sendMessage function
async function sendMessage() {
    const message = document.getElementById('messageInput').value.trim();
    if (!message) return;
    
    // Show user message
    addChatMessage(message, true);
    document.getElementById('messageInput').value = '';
    
    // Get AI response from Railway API
    const aiResponse = await sendToAPI(message);
    
    // Show AI response
    setTimeout(() => {
        addChatMessage(aiResponse);
        addLog(`AI Response: ${aiResponse.substring(0, 50)}...`, 'info');
    }, 500);
}

// ভেরিয়েবল
let messageCount = 0;
let userCount = 0;
let isBotRunning = false;
let socket = null;

// লগ ফাংশন
function addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('bn-BD');
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.innerHTML = `
        <span class="timestamp">[${timestamp}]</span>
        <span class="log-message">${message}</span>
    `;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// চ্যাট মেসেজ যোগ
function addChatMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    messageDiv.innerHTML = `
        <div class="avatar">
            <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
        </div>
        <div class="content">
            <p>${message}</p>
            <span class="time">${new Date().toLocaleTimeString('bn-BD', {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // মেসেজ কাউন্ট আপডেট
    if (!isUser) {
        messageCount++;
        messageCountElement.textContent = messageCount;
    }
}

// QR কোড জেনারেট (ডেমো)
function generateQRCode() {
    // আসলে এখানে ব্যাকএন্ড API কল করতে হবে
    // ডেমোর জন্য র‍্যান্ডম QR দেখাচ্ছি
    qrCodeElement.innerHTML = `
        <div style="width: 200px; height: 200px; background: #f0f0f0; 
                    display: flex; align-items: center; 
                    justify-content: center; border-radius: 10px;">
            <div style="text-align: center;">
                <i class="fas fa-qrcode" style="font-size: 80px; color: #25D366;"></i>
                <p style="margin-top: 10px; font-size: 12px;">ডেমো QR কোড</p>
            </div>
        </div>
    `;
    qrMessageElement.textContent = 'QR প্রস্তুত! WhatsApp ওয়েব দিয়ে স্ক্যান করুন';
    addLog('QR কোড জেনারেট হয়েছে', 'success');
}

// বট স্ট্যাটাস আপডেট
function updateBotStatus(connected) {
    isBotRunning = connected;
    statusIndicator.className = `status-indicator ${connected ? 'connected' : ''}`;
    statusText.textContent = connected ? 'কানেক্টেড' : 'ডিসকানেক্টেড';
    statusText.style.color = connected ? '#28a745' : '#dc3545';
    
    if (connected) {
        startBotBtn.disabled = true;
        stopBotBtn.disabled = false;
        addChatMessage('🤖 WhatsApp AI বট এখন এক্টিভ! মানুষ আপনার সাথে চ্যাট করতে পারে।');
    } else {
        startBotBtn.disabled = false;
        stopBotBtn.disabled = true;
    }
}

// AI রেসপন্স জেনারেট (ডেমো)
function getAIResponse(userMessage) {
    const responses = {
        'hi': 'Hello! How can I help you today? 😊',
        'hello': 'Hi there! Nice to meet you!',
        'কেমন আছো': 'আলহামদুলিল্লাহ, ভালো আছি! আপনি কেমন আছেন?',
        'তোমার নাম কি': 'আমি AI চ্যাটবট, আপনি চাইলে আমাকে যে নামে ডাকবেন!',
        'help': 'আমি আপনাকে সাধারণ তথ্য দিয়ে সাহায্য করতে পারি। কী জানতে চান?',
        'ধন্যবাদ': 'আপনাকেও অসংখ্য ধন্যবাদ! 😇',
        'bye': 'বিদায়! ভালো থাকবেন। আবার কথা হবে!',
        'weather': 'আজকের আবহাওয়া খুবই সুন্দর!',
        'time': `এখন সময়: ${new Date().toLocaleTimeString('bn-BD')}`,
    };
    
    const lowerMsg = userMessage.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
        if (lowerMsg.includes(key.toLowerCase())) {
            return response;
        }
    }
    
    return `আপনার মেসেজ: "${userMessage}"। আমি এখনো শিখছি। আপনি অন্য কিছু জিজ্ঞাসা করুন!`;
}

// ইভেন্ট লিসেনার
document.addEventListener('DOMContentLoaded', () => {
    // ইনিশিয়াল স্ট্যাটাস
    updateBotStatus(false);
    generateQRCode();
    addLog('সিস্টেম লোড সম্পন্ন', 'info');
    
    // বাটন ইভেন্ট
    startBotBtn.addEventListener('click', () => {
        addLog('বট শুরু করার রিকোয়েস্ট পাঠানো হয়েছে', 'warning');
        updateBotStatus(true);
        
        // ডেমো - আসলে API কল হবে
        setTimeout(() => {
            userCount++;
            userCountElement.textContent = userCount;
            addChatMessage('🎉 বট সফলভাবে শুরু হয়েছে! মানুষ এখন মেসেজ পাঠাতে পারে।');
            addLog('WhatsApp AI বট সফলভাবে কানেক্টেড', 'success');
        }, 2000);
    });
    
    stopBotBtn.addEventListener('click', () => {
        addLog('বট বন্ধ করার রিকোয়েস্ট পাঠানো হয়েছে', 'warning');
        updateBotStatus(false);
        addChatMessage('📴 বট বন্ধ করা হয়েছে। QR স্ক্যান করে আবার শুরু করুন।');
        addLog('বট স্টপ হয়েছে', 'info');
    });
    
    generateQRBtn.addEventListener('click', generateQRCode);
    
    // চ্যাট মেসেজ পাঠানো
    sendMessageBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;
        
        // ইউজার মেসেজ দেখাও
        addChatMessage(message, true);
        messageInput.value = '';
        
        // AI রেসপন্স
        setTimeout(() => {
            const aiResponse = getAIResponse(message);
            addChatMessage(aiResponse);
            addLog(`AI রেসপন্স জেনারেট: ${aiResponse.substring(0, 50)}...`, 'info');
        }, 1000);
    }
    
    // লগ ক্লিয়ার
    clearLogsBtn.addEventListener('click', () => {
        logContainer.innerHTML = '';
        addLog('লগ পরিষ্কার করা হয়েছে', 'warning');
    });
    
    // সেটিংস সেভ
    document.getElementById('saveSettings').addEventListener('click', () => {
        const model = document.getElementById('aiModel').value;
        const language = document.getElementById('language').value;
        
        addLog(`সেটিংস সেভ করা হয়েছে: AI মডেল - ${model}, ভাষা - ${language}`, 'success');
        alert('সেটিংস সফলভাবে সেভ হয়েছে!');
    });
    
    // GitHub Pages গাইড
    document.querySelector('.github-btn').addEventListener('click', (e) => {
        addLog('GitHub Pages গাইড দেখানো হচ্ছে', 'info');
    });
    
    // ডেমো অটো মেসেজ
    setTimeout(() => {
        if (!isBotRunning) {
            addChatMessage('▶️ "বট শুরু করুন" বাটনে ক্লিক করে আপনার WhatsApp AI বট এক্টিভ করুন!');
        }
    }, 3000);
});

// ব্যাকএন্ড API কল (ডেমো)
async function connectToBackend() {
    try {
        // আসলে এখানে আপনার Node.js সার্ভারের API কল করতে হবে
        const response = await fetch('http://localhost:3000/api/start-bot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        const data = await response.json();
        if (data.qr) {
            // আসল QR কোড দেখাবে
            // QRCode.js বা similar library ব্যবহার করুন
        }
    } catch (error) {
        console.error('Backend connection failed:', error);
        addLog('ব্যাকএন্ড সংযোগ ব্যর্থ। সার্ভার চেক করুন।', 'error');
    }
}

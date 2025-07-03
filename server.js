const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/stockApp', {});

// Chat Schema
const chatSchema = new mongoose.Schema({
    user: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', chatSchema);

// Delete previous chat on server restart
async function clearPreviousChats() {
    try {
        await Chat.deleteMany({});
        console.log('Previous chats deleted.');
    } catch (err) {
        console.error('Error deleting previous chats:', err);
    }
}
clearPreviousChats();

// Stock API
const STOCK_API_URL = "https://finnhub.io/api/v1/quote";
const STOCK_API_KEY = process.env.STOCK_API_KEY;

app.get('/api/stock/:symbol', async (req, res) => {
    const { symbol } = req.params;
    try {
        const response = await axios.get(`${STOCK_API_URL}?symbol=${symbol}&token=${STOCK_API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching stock data' });
    }
});

// Handle Socket.io chat
io.on('connection', (socket) => {
    let username = '';

    socket.on('setUsername', (name) => {
        username = name;
        console.log(`${username} connected.`);
    });

    socket.on('chatMessage', (data) => {
        const newMessage = new Chat({ user: username, message: data.message });
        newMessage.save().then(() => {
            io.emit('chatMessage', { user: username, message: data.message });
        });
    });

    socket.on('disconnect', () => {
        console.log(`${username || 'A user'} disconnected`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

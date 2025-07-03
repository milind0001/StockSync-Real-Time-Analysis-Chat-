const socket = io();

let username = '';

// Login
document.getElementById('loginBtn').addEventListener('click', () => {
    const input = document.getElementById('usernameInput').value.trim();
    if (input) {
        username = input;
        socket.emit('setUsername', username);
        document.getElementById('authModal').style.display = 'none';
    }
});

// Receive chat
socket.on('chatMessage', (data) => {
    appendMessage(data.user, data.message);
});

// Send chat on button click
document.getElementById('sendMessage').addEventListener('click', () => {
    sendMessage();
});

// Send chat on Enter key
document.getElementById('messageInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});

function sendMessage() {
    const messageInput = document.getElementById('messageInput').value.trim();
    if (messageInput) {
        socket.emit('chatMessage', { message: messageInput });
        document.getElementById('messageInput').value = '';
    }
}

function appendMessage(user, message) {
    const chatWindow = document.getElementById('chatWindow');
    const msgEl = document.createElement('div');
    msgEl.innerHTML = `<strong>${user}</strong>: ${message}`;
    chatWindow.appendChild(msgEl);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Stocks
const stockSearch = document.getElementById('stockSearch');
const stockOptions = document.getElementById('stockOptions');
let selectedStock = '';

stockSearch.addEventListener('input', () => {
    const query = stockSearch.value.trim().toUpperCase();
    if (query) {
        stockOptions.innerHTML = `<button onclick="selectStock('${query}')">${query}</button>`;
        stockOptions.style.display = 'block';
    } else {
        stockOptions.innerHTML = '';
        stockOptions.style.display = 'none';
    }
});

function selectStock(stock) {
    selectedStock = stock;
    stockOptions.innerHTML = `<p>Selected Stock: ${stock}</p>`;
    stockOptions.style.display = 'none';
}

document.getElementById('fetchStock').addEventListener('click', () => {
    if (selectedStock) {
        fetch(`/api/stock/${selectedStock}`)
            .then(res => res.json())
            .then(data => {
                if (data.c) {
                    displayStockData(selectedStock, data);
                } else {
                    alert('No data found for this stock');
                }
            })
            .catch(console.error);
    }
});

let stockChartInstance = null;

function displayStockData(stock, data) {
    const ctx = document.getElementById('stockChart').getContext('2d');

    // Destroy old chart if exists
    if (stockChartInstance) {
        stockChartInstance.destroy();
    }

    stockChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Current', 'High', 'Low', 'Open', 'Prev Close'],
            datasets: [{
                label: stock,
                data: [data.c, data.h, data.l, data.o, data.pc],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

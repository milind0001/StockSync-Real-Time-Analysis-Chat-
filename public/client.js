const socket = io();

// Handle live chat
socket.on('previousMessages', (messages) => {
    messages.forEach(message => appendMessage(message.user, message.message));
});

socket.on('chatMessage', (data) => {
    appendMessage(data.user, data.message);
});

document.getElementById('sendMessage').addEventListener('click', () => {
    const messageInput = document.getElementById('messageInput').value.trim();
    if (messageInput) {
        socket.emit('chatMessage', { message: messageInput });
        document.getElementById('messageInput').value = '';
    }
});

function appendMessage(username, message) {
    const chatWindow = document.getElementById('chatWindow');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<strong>${username}</strong>: ${message}`;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Stock Search and Fetch
const stockSearch = document.getElementById('stockSearch');
const stockOptions = document.getElementById('stockOptions');
let selectedStock = '';

stockSearch.addEventListener('input', () => {
    const query = stockSearch.value.trim().toUpperCase();
    if (query) {
        stockOptions.innerHTML = `<button onclick="selectStock('${query}')">${query}</button>`;
    } else {
        stockOptions.innerHTML = '';
    }
});

function selectStock(stock) {
    selectedStock = stock;
    document.getElementById('stockOptions').innerHTML = `<p>Selected Stock: ${stock}</p>`;
}

document.getElementById('fetchStock').addEventListener('click', () => {
    if (selectedStock) {
        fetchStockData(selectedStock);
    }
});

function fetchStockData(stock) {
    fetch(`/api/stock/${stock}`)
        .then(response => response.json())
        .then(data => {
            if (data.c) {
                displayStockData(stock, data);
            } else {
                alert('No data found for the selected stock');
            }
        })
        .catch(error => console.error('Error fetching stock data:', error));
}

function displayStockData(stock, data) {
    const ctx = document.getElementById('stockChart').getContext('2d');
    const chartData = {
        labels: ['Current', 'High', 'Low', 'Open', 'Previous Close'],
        datasets: [{
            label: stock,
            data: [data.c, data.h, data.l, data.o, data.pc],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };
    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

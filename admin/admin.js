// REST API функции
async function fetchProducts() {
    const response = await fetch('http://localhost:8080/products');
    return await response.json();
}

async function addProduct(product) {
    const response = await fetch('http://localhost:8080/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
    });
    return await response.json();
}

async function updateProduct(id, product) {
    const response = await fetch(`http://localhost:8080/products/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
    });
    return await response.json();
}

async function deleteProduct(id) {
    const response = await fetch(`http://localhost:8080/products/${id}`, {
        method: 'DELETE'
    });
    return await response.json();
}

// Управление интерфейсом
function renderProducts(products) {
    const table = document.getElementById('productList');
    table.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.description}</td>
            <td>${product.categories.join(', ')}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="editProduct('${product.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteProductHandler('${product.id}')">Delete</button>
            </td>
        `;
        table.appendChild(row);
    });
}

// WebSocket чат
const chatSocket = new WebSocket('ws://localhost:8081');

document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message) {
        chatSocket.send(JSON.stringify({
            sender: 'Admin',
            text: message,
            timestamp: new Date().toISOString()
        }));
        
        addMessage('You', message);
        input.value = '';
    }
}

function addMessage(sender, text) {
    const messages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
}

chatSocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const sender = message.sender === 'Customer' ? 'Customer' : 'Admin';
    addMessage(sender, message.text);
};

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    const products = await fetchProducts();
    renderProducts(products);
    
    // Обработчик формы
    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const product = {
            name: document.getElementById('name').value,
            price: parseFloat(document.getElementById('price').value),
            description: document.getElementById('description').value,
            categories: document.getElementById('categories').value.split(',').map(c => c.trim())
        };
        
        const id = document.getElementById('productId').value;
        if (id) {
            await updateProduct(id, product);
        } else {
            await addProduct(product);
        }
        
        const products = await fetchProducts();
        renderProducts(products);
        document.getElementById('productForm').reset();
    });
    
    // Кнопка отмены
    document.getElementById('cancel-btn').addEventListener('click', () => {
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('submit-btn').textContent = 'Add Product';
    });
});
// REST API функции
async function fetchProducts() {
    const response = await fetch('http://localhost:8080/products');
    return await response.json();
  }
  
  // WebSocket чат для админа
  const chatSocket = new WebSocket('ws://localhost:8081');
  
  chatSocket.onopen = () => {
    chatSocket.send(JSON.stringify({
      type: 'init',
      sender: 'admin'
    }));
  };
  
  // Остальной код админки...
// Глобальные функции для кнопок
window.editProduct = async function(id) {
    const products = await fetchProducts();
    const product = products.find(p => p.id === id);
    
    if (product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('name').value = product.name;
        document.getElementById('price').value = product.price;
        document.getElementById('description').value = product.description;
        document.getElementById('categories').value = product.categories.join(', ');
        document.getElementById('submit-btn').textContent = 'Update Product';
    }
};

window.deleteProductHandler = async function(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        await deleteProduct(id);
        const products = await fetchProducts();
        renderProducts(products);
    }
};
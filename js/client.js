const socket = io('http://localhost:8001');
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector(".container");
const userListContainer = document.createElement('div'); // Active user list container
userListContainer.classList.add('user-list');
document.body.insertBefore(userListContainer, document.body.firstChild); // Add it above the chat

let typingTimeout;

// Function to append messages
const append = (message, position, timestamp = '') => {
    const messageElement = document.createElement('div');
    messageElement.innerText = `${message} ${timestamp ? `(${timestamp})` : ''}`;
    messageElement.classList.add('message', position);
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight; // Auto-scroll
};

// Display active user list
const updateUserList = (users) => {
    userListContainer.innerHTML = `<h3>Active Users</h3>`;
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.innerText = user;
        userListContainer.appendChild(userElement);
    });
};

// Typing indicator
const showTyping = (user) => {
    const typingElement = document.getElementById('typing-indicator');
    if (!typingElement) {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.innerText = `${user} is typing...`;
        messageContainer.appendChild(typingDiv);
    }
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) typingDiv.remove();
    }, 2000);
};

// Send message
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    const timestamp = new Date().toLocaleTimeString();
    append(`You: ${message}`, 'right', timestamp);
    socket.emit('send', message);
    messageInput.value = '';
});

// Notify server when typing
messageInput.addEventListener('input', () => {
    socket.emit('typing');
});

// Prompt user for name
const name = prompt("Enter your name");
socket.emit('new-user-joined', name);

// Event listeners for server events
socket.on('user-joined', (name) => append(`${name} joined the chat`, 'center'));
socket.on('receive', (data) => append(`${data.name}: ${data.message}`, 'left', data.timestamp));
socket.on('left', (name) => append(`${name} left the chat`, 'center'));
socket.on('update-user-list', updateUserList);
socket.on('user-typing', showTyping);

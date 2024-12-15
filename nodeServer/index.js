const io = require('socket.io')(8001, {
    cors: {
        origin: "http://127.0.0.1:5500", 
        methods: ["GET", "POST"]
    }
});

const users = {}; 

io.on('connection', (socket) => {
    socket.on('new-user-joined', (name) => {
        console.log("New user", name);
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
        io.emit('update-user-list', Object.values(users)); // Broadcast the updated user list
    });

    socket.on('send', (message) => {
        const timestamp = new Date().toLocaleTimeString();
        socket.broadcast.emit('receive', {
            message,
            name: users[socket.id],
            timestamp,
        });
    });

    socket.on('typing', () => {
        socket.broadcast.emit('user-typing', users[socket.id]);
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
        io.emit('update-user-list', Object.values(users)); // Broadcast updated user list
    });
});

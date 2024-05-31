const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Inicializar Express
const app = express();

// Configurar CORS para permitir solicitudes desde cualquier origen
app.use(cors());

// Crear servidor HTTP y asociarlo con Express
const server = http.createServer(app);

// Inicializar Socket.IO con el servidor HTTP
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Configurar Express para servir archivos estáticos
app.use(express.json());


// Endpoint para recibir notificaciones y enviarlas a los clientes conectados
app.post('/transcription', (req, res) => {
    console.log('Notificación recibida:', req.body)
    const { refresh } = req.body;
    if (refresh) {
        console.log('Notificación recibida:', refresh);
        io.emit('transcription', refresh);
        res.status(200).send({ success: true, message: 'Notificación enviada' });
    } else {
        res.status(400).send({ success: false, message: 'Falta el campo refresh' });
    }
});


// Configurar la conexión de Socket.IO
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Escuchar eventos desde el cliente
    socket.on('mensaje', (data) => {
        console.log('Mensaje recibido:', data);
        // Enviar mensaje a todos los clientes conectados
        io.emit('mensaje', data);
    });

    // Manejar desconexión del cliente
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

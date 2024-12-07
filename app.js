const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const roomRoutes = require('./routes/roomRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes')
const { verifyToken } = require('./middleware/authMiddleware');
const bearerToken = require('express-bearer-token');
const bodyParser = require('body-parser');
const path = require("path");
const fs = require("fs");
// Import các routes khác

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('secret', 'mySecret');
app.use(express.json());

// Sử dụng bearerToken middleware để lấy token từ header
app.use(bearerToken());

// // Sử dụng middleware cho toàn bộ routes
app.use(verifyToken);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/users', userRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/devices', deviceRoutes);
// Sử dụng các routes khác

const PORT = process.env.PORT || 8080;

const startServer = async () => {
    app.listen(PORT, '127.0.0.1', () => {
        console.log(`Server is running at http://127.0.0.1:${PORT}`);
    });
};


startServer();
import http from 'http';
import app from './src/app.js';
import { config } from './src/config/env.js';
import connectDB from './src/config/db.js';
import { initSocket } from './src/socket.js';

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDB();
    
    // Initialize Socket.IO server
    initSocket(server);

    server.listen(config.port, () => {
      console.log(`🚀 VibeSpace Server running on port ${config.port}`);
      console.log(`🌐 Local URL: http://localhost:${config.port}`);
      console.log(`⚡ Real-Time Socket.IO Enabled`);
      console.log(`📁 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start VibeSpace server:', error.message);
    process.exit(1);
  }
};

startServer();

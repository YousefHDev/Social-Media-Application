import app from './src/app.js';
import { config } from './src/config/env.js';
import connectDB from './src/config/db.js';

const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`================================================`);
      console.log(`🚀 Social Media API Server running on port ${config.port}`);
      console.log(`🌐 Local URL: http://localhost:${config.port}`);
      console.log(`📁 Environment: ${config.nodeEnv}`);
      console.log(`================================================`);
    });
  } catch (error) {
    console.error('Failed to start local server:', error.message);
    process.exit(1);
  }
};

startServer();


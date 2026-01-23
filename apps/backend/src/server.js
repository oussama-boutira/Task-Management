import { app } from "./app.js";
import { config } from "./config/index.js";

const startServer = async () => {
  try {
    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
      console.log(`📝 API available at http://localhost:${config.port}/api/v1`);
      console.log(`🔧 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

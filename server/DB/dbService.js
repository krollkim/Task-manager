import config from "config";

const ENVIRONMENT = config.get("NODE_ENV");

export const connectToDb = async () => {
  // Use Atlas for both development and production
  console.log(`Environment: ${ENVIRONMENT} - Connecting to MongoDB Atlas...`);
  await import("./mongoDB/connectToAtlas.js");
};

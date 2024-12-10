import config from "config";

const ENVIRONMENT = config.get("NODE_ENV");

export const connectToDb = async () => {
  if (ENVIRONMENT === "development") {
    await import("./mongoDB/connectToMongodbLocally.js");
  } else if (ENVIRONMENT === "production") {
    await import("./mongoDB/connectToAtlas.js");
  } else {
    console.log("No valid environment set for database connection");
  }
};

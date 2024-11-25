const config = require("config");

const ENVIRONMENT = config.get("NODE_ENV");

const connectToDb = () => {
  if (ENVIRONMENT === "development") {
    require("./mongoDB/connectToMongodbLocally");
  } else if (ENVIRONMENT === "production") {
    require("./mongoDB/connectToAtlas");
  } else {
    console.log("No valid environment set for database connection");
  }
};

module.exports = connectToDb;

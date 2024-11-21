const mongoose = require("mongoose");
const chalk = require("chalk");
const config = require("config");

const userName = config.get("DB_NAME");
const password = config.get("DB_PASSWORD");
const clusterUrl = "cluster0.mlv7t.mongodb.net";
const dbName = "task_manager";

const uri = `mongodb+srv://${userName}:${password}@${clusterUrl}/${dbName}?retryWrites=true&w=majority`;

mongoose
  .connect(uri)
  .then(() => console.log(chalk.magentaBright("Connected to MongoDB Atlas!")))
  .catch((error) =>
    console.log(chalk.redBright.bold(`Could not connect to MongoDB: ${error}`))
  );
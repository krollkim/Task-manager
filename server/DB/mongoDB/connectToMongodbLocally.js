const mongoose = require("mongoose");
const chalk = require("chalk");

mongoose
  .connect("mongodb://127.0.0.1:27017/task_manager")
  .then(() => console.log(chalk.magentaBright("connected to MongoDb Locally!")))
  .catch(error =>
    console.log(chalk.redBright.bold(`could not connect to mongoDb: ${error}`))
  );

  module.exports = mongoose;

import mongoose from "mongoose";
import chalk from "chalk";
import config from "config";

const userName = config.get("DB_NAME");
const password = config.get("DB_PASSWORD");
const clusterUrl = "cluster0.mlv7t.mongodb.net";
const dbName = "task_manager";

export const uri = `mongodb+srv://${userName}:${password}@${clusterUrl}/${dbName}?retryWrites=true&w=majority`;

mongoose
  .connect(uri)
  .then(() => console.log(chalk.magentaBright("Connected to MongoDB Atlas!")))
  .catch((error) =>
    console.log(chalk.redBright.bold(`Could not connect to MongoDB: ${error}`))
  );

  console.log(`Connecting with user: ${userName} and password: ${password}`);

 export default mongoose;
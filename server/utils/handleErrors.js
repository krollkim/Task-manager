import chalk from "chalk";


export const handleError = (res, status, message = "") => {
  if (!res || typeof res.status !== "function") {
    console.error("Invalid Response object passed to handleError.");
    return; // Exit early to prevent further errors.
  }
  if (res.headersSent) {
    console.error("Cannot set headers after they are sent to the client.");
    return; // Prevent duplicate response attempts.
  }
  console.log(chalk.redBright(message));
  return res.status(status).send(message);
};


export const handleBadRequest = async (validator, error) => {
  const errorMessage = `${validator} Error: ${error.message}`;
  error.message = errorMessage;
  error.status = error.status || 400;
  return Promise.reject(error);
};

// const handleJoiError = async error => {
//   const joiError = new Error(error.details[0].message);
//   return handleBadRequest("Joi", joiError);
// };

// exports.handleJoiError = handleJoiError;

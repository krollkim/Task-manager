import express from "express";
import app from express();
import cors from "cors";

app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:3000"],
    optionsSuccessStatus: 200,
  })
);

export default app;

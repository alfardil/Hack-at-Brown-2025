import express from "express";
import lobbyRouter from "./rooms";

export const apiRouter = express.Router();

apiRouter.use("/lobby", lobbyRouter);
import express from "express";
import lobbyRouter from "./roomsRouter";
import gameRouter from "./gameRouter";

export const apiRouter = express.Router();

apiRouter.use("/lobby", lobbyRouter);
apiRouter.use("/game", gameRouter);
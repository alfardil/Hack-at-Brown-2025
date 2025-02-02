import { Router } from 'express';

const lobbyRouter = Router();

lobbyRouter.post('/create', (req, res) => {
  res.status(201).json({ message: 'Lobby created' });
});

export default lobbyRouter;
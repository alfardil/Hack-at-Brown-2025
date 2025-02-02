import { Router, Request, Response } from 'express';
import { db } from '../lib/db';
import { DebateResponse, Room } from './roomsRouter';

export const gameRouter = Router();
const Rooms = db.collection<Room>('Rooms');

gameRouter.post("/create", async (req: Request, res: Response) => {
  const newGameId = `game-${Date.now()}`; 
  await Rooms.insertOne({
    gameId: newGameId,
    players: 2,
    messages: [],
    createdAt: new Date(),
    playerIds: [],
    turn: 0,
    responses: [],
    ended: false,
    code: ''
  });

  res.json({ gameId: newGameId });
});

gameRouter.post('/:gameId/addResponse', async (req: Request, res: Response): Promise<void> => {
  const { gameId } = req.params;
  const { playerId, transcript, rating } = req.body;
  try {
    const room = await Rooms.findOne({ gameId });
    if (!room) {
      res.status(404).json({ error: 'Game not found.' });
      return;
    }
    if (room.ended) {
      res.status(400).json({ error: 'Game already ended.' });
      return;
    }
    if (!room.playerIds) {
      res.status(400).json({ error: 'Game not started yet.' });
      return;
    }
    const newResponse: DebateResponse = {
      playerId,
      transcript,
      rating,
      timestamp: new Date(),
    };
    const responses = room.responses || [];
    responses.push(newResponse);
    const responseCount = room.responseCount || {};
    responseCount[playerId] = (responseCount[playerId] || 0) + 1;
    const [p1, p2] = room.playerIds;
    const maxResp = room.maxResponses || 3;
    let ended = false;
    if (responseCount[p1] >= maxResp && responseCount[p2] >= maxResp) {
      ended = true;
    }
    let turn = room.turn || 0;
    if (!ended) {
      turn = (turn + 1) % 2;
    }
    await Rooms.updateOne(
      { gameId },
      {
        $set: {
          responses,
          responseCount,
          turn,
          ended,
        },
      }
    );
    res.json({ success: true, ended });
  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET game state by gameId
gameRouter.get('/:gameId/gameState', async (req: Request, res: Response): Promise<void> => {
  const { gameId } = req.params;
  try {
    const room = await Rooms.findOne({ gameId });
    if (!room) {
      res.status(404).json({ error: 'Game not found.' });
      return;
    }
    res.status(200).json(room);
  } catch (error) {
    console.error('Error fetching game state:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

gameRouter.post('/:gameId/endTurn', async (req: Request, res: Response): Promise<void> => {
  const { gameId } = req.params;
  try {
    const room = await Rooms.findOne({ gameId });
    if (!room || !room.playerIds) {
      res.status(404).json({ error: 'Game not found or game not started.' });
      return;
    }
    const nextTurn = (room.turn || 0) === 0 ? 1 : 0;
    await Rooms.updateOne({ gameId }, { $set: { turn: nextTurn } });
    res.json({ success: true, turn: nextTurn });
  } catch (error) {
    console.error('Error ending turn:', error);
    res.status(500).json({ error: 'Failed to end turn.' });
  }
});

gameRouter.post('/:gameId/nextTurn', async (req: Request, res: Response): Promise<void> => {
  const { gameId } = req.params;

  try {
    const room = await Rooms.findOne({ gameId });

    if (!room) {
      res.status(404).json({ error: "Game not found." });
      return;
    }

    const nextTurn = (room.turn || 0) === 0 ? 1 : 0;
    const turnDeadline = new Date();
    turnDeadline.setSeconds(turnDeadline.getSeconds() + 30);

    await Rooms.updateOne(
      { gameId },
      { $set: { turn: nextTurn, turnDeadline } }
    );

    res.json({ success: true, turn: nextTurn, turnDeadline });
  } catch (error) {
    console.error("Error updating turn:", error);
    res.status(500).json({ error: "Failed to update turn." });
  }
});

gameRouter.post('/:gameId/start', async (req: Request, res: Response): Promise<void> => {
  const { gameId } = req.params;
  try {
    const room = await Rooms.findOne({ gameId });
    if (!room) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    const turnDeadline = new Date();
    turnDeadline.setSeconds(turnDeadline.getSeconds() + 30); // 30 seconds

    await Rooms.updateOne(
      { gameId },
      { $set: { currentTurn: 0, turnDeadline } }
    );

    res.json({ success: true, turn: 0, turnDeadline });
  } catch (error) {
    console.error("Error starting game:", error);
    res.status(500).json({ error: "Failed to start game." });
  }
});

gameRouter.post('/:gameId/evaluate', async (req: Request, res: Response): Promise<void> => {
  const { gameId } = req.params;

  try {
    const room = await Rooms.findOne({ gameId });
    if (!room || room.responses.length < room.playerIds.length) {
      res.status(400).json({ error: "Not all players have submitted responses." });
      return;
    }

    const aiRes = await chatClient.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Evaluate the following texts and rate them on a scale of 1 to 10.",
        },
        ...room.responses.map((resp: any) => ({
          role: "user",
          content: resp.transcript,
        })),
      ],
    });

    const scores = aiRes.choices[0].message?.content;
    res.json({ success: true, scores });
  } catch (error) {
    console.error("Error evaluating responses:", error);
    res.status(500).json({ error: "Failed to evaluate responses." });
  }
});

export default gameRouter;
import { Router, Request, Response } from 'express';
import { db } from '../lib/db';
import { DebateResponse, Room } from './roomsRouter';

export const gameRouter = Router();
const Rooms = db.collection<Room>('Rooms');


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

export default gameRouter;
import { Router, Request, Response } from 'express';
import { db } from '../lib/db';

export interface DebateResponse {
  playerId: string;
  transcript: string;
  rating: string;
  timestamp: Date;
}

export interface Room {
  code: string;
  players: number;
  messages: string[];
  createdAt: Date;
  prompt?: string;
  playerIds?: string[];
  turn?: number;
  responses?: DebateResponse[];
  responseCount?: Record<string, number>;
  maxResponses?: number;
  ended?: boolean;
  gameId?: string;
}

export const roomsRouter = Router();
const Rooms = db.collection<Room>('Rooms');

/**
 * POST /api/lobby/create
 * Creates a new room with a random 5-digit code, 1 player, etc.
 */
roomsRouter.post('/create', async (req: Request, res: Response) => {
  try {
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const newRoom: Room = {
      code,
      players: 1,
      messages: [],
      createdAt: new Date(),
      prompt: null!,
    };
    await Rooms.insertOne(newRoom);
    res.status(201).json({ code });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/lobby/join
 * Body: { code }
 * Joins an existing room if players < 2.
 */
roomsRouter.post('/join', async (req: Request, res: Response): Promise<void> => {
  const { code } = req.body;
  try {
    const room = await Rooms.findOne({ code });
    if (!room) {
      res.status(404).json({ error: 'Lobby not found.' });
      return;
    }
    if (room.players >= 2) {
      res.status(400).json({ error: 'Lobby is full.' });
      return;
    }

    await Rooms.updateOne({ code }, { $inc: { players: 1 } });
    res.status(200).json({ code: room.code });
  } catch (error) {
    console.error('Error joining lobby:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/lobby/:code
 * Returns basic lobby info (players, prompt, etc.).
 * Used by the waiting room to see if two players have joined.
 */
roomsRouter.get('/:code', async (req: Request, res: Response): Promise<void> => {
  const { code } = req.params;
  try {
    const room = await Rooms.findOne({ code });
    if (!room) {
      res.status(404).json({ error: 'Lobby not found.' });
      return;
    }
    res.status(200).json(room);
  } catch (error) {
    console.error('Error fetching lobby:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/lobby/:code/startGame
 * Body: { playerIds: string[] }
 * Initializes the game and assigns a shared gameId to the room.
 */
roomsRouter.post('/:code/startGame', async (req: Request, res: Response): Promise<void> => {
  const { code } = req.params;
  const { playerIds } = req.body;

  try {
    console.log(`Starting game for room code: ${code}, playerIds: ${playerIds}`);

    const room = await Rooms.findOne({ code });
    if (!room) {
      console.error('Room not found');
      res.status(404).json({ error: 'Room not found.' });
      return;
    }

    const gameId = room.gameId || `game-${Date.now()}`;
    console.log(`Generated gameId: ${gameId}`);

    await Rooms.updateOne({ code }, { $set: { playerIds, gameId } });
    console.log(`Game started for room code: ${code}`);

    res.json({ success: true, gameId });
  } catch (error) {
    console.error('Error in /startGame:', error);
    res.status(500).json({ error: 'Failed to start game.' });
  }
});

export default roomsRouter;
